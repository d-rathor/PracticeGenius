const Worksheet = require('../models/worksheet.model');
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const { APIError } = require('../middleware/error');
const asyncHandler = require('../utils/async-handler');
const path = require('path');
const fs = require('fs');
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// B2 Configuration (should ideally be shared from a config file)
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;
const B2_ENDPOINT = process.env.B2_ENDPOINT;
const B2_REGION = process.env.B2_REGION;



let s3Client; // Initialize S3 client once
if (B2_KEY_ID && B2_APPLICATION_KEY && B2_BUCKET_NAME && B2_ENDPOINT && B2_REGION) {
  s3Client = new S3Client({
    endpoint: `https://${B2_ENDPOINT}`,
    region: B2_REGION,
    credentials: {
      accessKeyId: B2_KEY_ID,
      secretAccessKey: B2_APPLICATION_KEY,
    },
    forcePathStyle: true,
  });

  // Align with the fileUpload client: explicitly remove the middleware that adds unsupported headers.
  s3Client.middlewareStack.remove('flexibleChecksumsMiddleware');
  console.log('[B2 COMPATIBILITY] Removed flexibleChecksumsMiddleware from S3 client stack in worksheet controller.');

  
} else {
  console.error('Backblaze B2 environment variables are not fully configured for S3 client in worksheet controller.');
  // s3Client will remain undefined, and presigned URL generation will fail
}

/**
 * @desc    Get all worksheets with filtering and pagination
 * @route   GET /api/worksheets
 * @access  Public (with subscription level filtering)
 */
exports.getAllWorksheets = asyncHandler(async (req, res) => {
  // Build query
  const query = {};
  
  // Filter by subject
  if (req.query.subject) {
    query.subject = req.query.subject;
  }
  
  // Filter by grade
  if (req.query.grade) {
    query.grade = req.query.grade;
  }
  
  // Filter by subscription level
  if (req.query.subscriptionLevel) {
    query.subscriptionLevel = req.query.subscriptionLevel;
  }
  
  // Search by title, description, or keywords
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { keywords: { $in: [new RegExp(req.query.search, 'i')] } }
    ];
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Execute query
  const worksheets = await Worksheet.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Get total count
  const total = await Worksheet.countDocuments(query);
  
  res.json({
    success: true,
    data: worksheets,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get recent worksheets
 * @route   GET /api/worksheets/recent
 * @access  Public
 */
exports.getRecentWorksheets = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  
  const worksheets = await Worksheet.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
  
  res.json({
    success: true,
    data: worksheets
  });
});

/**
 * @desc    Create a new worksheet
 * @route   POST /api/worksheets
 * @access  Private/Admin
 */
exports.createWorksheet = asyncHandler(async (req, res) => {
  const { title, description, subject, grade, subscriptionLevel, keywords } = req.body;

  // Check if a file was uploaded by our B2 middleware
  if (!req.file) {
    throw new APIError('Worksheet document is required and was not uploaded.', 400);
  }

  // Extract B2 file details from req.file
  const fileData = {
    fileKey: req.file.key, // Key in B2 (path)
    fileUrl: req.file.location, // Full URL from B2 (provided by multer-s3)
    originalFilename: req.file.originalname,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
  };

  // Parse keywords if provided as string
  let parsedKeywords = keywords;
  if (typeof keywords === 'string') {
    parsedKeywords = keywords.split(',').map(keyword => keyword.trim());
  }

  // Create worksheet
  const worksheet = await Worksheet.create({
    title,
    description,
    subject,
    grade,
    subscriptionLevel,
    keywords: parsedKeywords,
    ...fileData, // Spread B2 file data
    // thumbnailUrl: will use model default or can be set if provided separately
    createdBy: req.user.id
  });

  // Populate creator
  await worksheet.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: worksheet
  });
});

/**
 * @desc    Get worksheet by ID
 * @route   GET /api/worksheets/:id
 * @access  Public (with subscription check)
 */
exports.getWorksheetById = asyncHandler(async (req, res) => {
  const worksheet = await Worksheet.findById(req.params.id)
    .populate('createdBy', 'name email');
  
  if (!worksheet) {
    throw new APIError('Worksheet not found', 404);
  }
  
  res.json({
    success: true,
    data: worksheet
  });
});

/**
 * @desc    Update worksheet
 * @route   PUT /api/worksheets/:id
 * @access  Private/Admin
 */
exports.updateWorksheet = asyncHandler(async (req, res) => {
  let worksheet = await Worksheet.findById(req.params.id);
  
  if (!worksheet) {
    throw new APIError('Worksheet not found', 404);
  }
  
  // Update fields
  const { title, description, subject, grade, subscriptionLevel, keywords } = req.body;
  
  // Parse keywords if provided as string
  let parsedKeywords = keywords;
  if (typeof keywords === 'string') {
    parsedKeywords = keywords.split(',').map(keyword => keyword.trim());
  }
  
  // Update basic fields
  worksheet.title = title || worksheet.title;
  worksheet.description = description || worksheet.description;
  worksheet.subject = subject || worksheet.subject;
  worksheet.grade = grade || worksheet.grade;
  worksheet.subscriptionLevel = subscriptionLevel || worksheet.subscriptionLevel;
  worksheet.keywords = parsedKeywords || worksheet.keywords;
  
  // Update file if a new one is uploaded via B2 middleware
  if (req.file) {
    // If there was an old file, try to delete it from B2
    if (worksheet.fileKey && s3Client) {
      const deleteParams = {
        Bucket: B2_BUCKET_NAME,
        Key: worksheet.fileKey,
      };
      try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log(`Successfully deleted old B2 object: ${worksheet.fileKey}`);
      } catch (err) {
        console.error(`Error deleting old B2 object ${worksheet.fileKey}:`, err);
        // Decide if this error should halt the update or just be logged
      }
    }

    // Update metadata with new file details
    worksheet.fileKey = req.file.key;
    worksheet.fileUrl = req.file.location;
    worksheet.originalFilename = req.file.originalname;
    worksheet.mimeType = req.file.mimetype;
    worksheet.fileSize = req.file.size;
  }

  // Thumbnail handling removed for now, will use model default or be set separately.
  
  // Save worksheet
  await worksheet.save();
  
  // Populate creator
  await worksheet.populate('createdBy', 'name email');
  
  res.json({
    success: true,
    data: worksheet
  });
});

/**
 * @desc    Delete worksheet
 * @route   DELETE /api/worksheets/:id
 * @access  Private/Admin
 */
exports.deleteWorksheet = asyncHandler(async (req, res) => {
  const worksheet = await Worksheet.findById(req.params.id);
  
  if (!worksheet) {
    throw new APIError('Worksheet not found', 404);
  }
  
  // Delete the file from B2 if it exists
  if (worksheet.fileKey && s3Client) {
    const deleteParams = {
      Bucket: B2_BUCKET_NAME,
      Key: worksheet.fileKey,
    };
    try {
      await s3Client.send(new DeleteObjectCommand(deleteParams));
      console.log(`Successfully deleted B2 object: ${worksheet.fileKey}`);
    } catch (err) {
      console.error(`Error deleting B2 object ${worksheet.fileKey}:`, err);
      // Decide if this error should halt the process or just be logged
      // For a delete operation, you might still want to proceed with deleting the DB record
    }
  }
  
  // Delete worksheet - using findByIdAndDelete instead of remove() which is deprecated
  await Worksheet.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Worksheet deleted successfully'
  });
});

/**
 * @desc    Download worksheet and track download
 * @route   POST /api/worksheets/:id/download
 * @access  Private (with subscription check)
 */
exports.downloadWorksheet = async (req, res, next) => {
  try {
  const worksheet = await Worksheet.findById(req.params.id);

  if (!worksheet) {
    throw new APIError('Worksheet not found', 404);
  }

  // Check user's subscription level
  const user = await User.findById(req.user.id).populate('activeSubscription');

  // If the user is not an admin, perform subscription and download limit checks
  if (user.role !== 'admin') {
    // Get user's subscription level
    let userSubscriptionLevel = 'Free';
    if (user.activeSubscription && user.activeSubscription.status === 'active') {
      const subscription = await Subscription.findById(user.activeSubscription).populate(
        'plan'
      );

      if (subscription && subscription.plan) {
        userSubscriptionLevel = subscription.plan.name;
      }
    }

    // Check if user can access this worksheet based on subscription level
    const subscriptionLevels = ['Free', 'Essential', 'Premium'];
    const worksheetLevelIndex = subscriptionLevels.indexOf(
      worksheet.subscriptionLevel
    );
    const userLevelIndex = subscriptionLevels.indexOf(userSubscriptionLevel);

    if (userLevelIndex < worksheetLevelIndex) {
      console.log(`[DownloadWorksheet] About to throw 403 for user ${user._id} needing ${worksheet.subscriptionLevel}`);
      throw new APIError(
        `You need a ${worksheet.subscriptionLevel} subscription to download this worksheet`,
        403
      );
      // The following log will likely not be reached if 'throw' works as expected
      // console.log(`[DownloadWorksheet] Successfully THREW 403 for user ${user._id}`); 
    }

    // Check download limits
    if (userSubscriptionLevel !== 'Premium') {
      // Get user's download count for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const downloadCount = user.downloadHistory.filter((download) => {
        const downloadDate = new Date(download.downloadedAt);
        return downloadDate >= today;
      }).length;

      // Check against limits
      const limits = {
        Free: 10, // Increased from 3 to 10 as per request
        Essential: 10,
      };

      if (downloadCount >= limits[userSubscriptionLevel]) {
        throw new APIError(
          `You have reached your daily download limit for ${userSubscriptionLevel} subscription`,
          403
        );
      }
    }
  }

  // Add a defensive check to prevent validation errors for users missing a name.
  if (!user.name && user.email) {
    console.warn(
      `User ${user._id} is missing a name. Setting a default from email to prevent crash.`
    );
    user.name = user.email.split('@')[0];
  }

  // Track download
  user.downloadHistory.push({
    worksheet: worksheet._id,
    downloadedAt: Date.now(),
  });

  await user.save();

  // Increment download count
  worksheet.downloads += 1;
  await worksheet.save();

  if (!s3Client) {
    throw new APIError('S3 client not configured, cannot generate download URL.', 500);
  }
  if (!worksheet.fileKey) {
    throw new APIError(
      'File key not found for this worksheet, cannot generate download URL.',
      404
    );
  }

  const getObjectParams = {
    Bucket: B2_BUCKET_NAME,
    Key: worksheet.fileKey,
  };

  // Suggest original filename for download
  if (worksheet.originalFilename) {
    getObjectParams.ResponseContentDisposition = `attachment; filename="${worksheet.originalFilename}"`;
  }

  const command = new GetObjectCommand(getObjectParams);

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    // Return pre-signed URL in the format the frontend expects
    res.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
      },
    });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    throw new APIError(
      'Could not generate download link. Please try again later.',
      500
    );
  }
  // This is the end of the inner try...catch for getSignedUrl
  } catch (error) {
    // This is the catch for the outer try block (started at line 301)
    console.error('[DownloadWorksheet] Caught error in outer manual try...catch:', error.name, error.message);
    // Log the full error object if it's an APIError to see its properties
    if (error instanceof APIError) {
        console.error('[DownloadWorksheet] APIError details:', JSON.stringify(error, null, 2));
    } else {
        console.error('[DownloadWorksheet] Non-APIError stack:', error.stack);
    }
    next(error); // Pass error to Express error handling middleware
  }
}; // This is the correct closing for the downloadWorksheet function
