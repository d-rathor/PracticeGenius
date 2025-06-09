const Worksheet = require('../models/worksheet.model');
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const { APIError } = require('../middleware/error');
const asyncHandler = require('../utils/async-handler');
const path = require('path');
const fs = require('fs');

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
  
  // Check if files were uploaded
  if (!req.files || !req.files.file) {
    throw new APIError('Please upload a worksheet file', 400);
  }
  
  // Get file paths
  const fileUrl = `/uploads/worksheets/${req.files.file[0].filename}`;
  const thumbnailUrl = req.files.thumbnail 
    ? `/uploads/thumbnails/${req.files.thumbnail[0].filename}`
    : null;
  
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
    fileUrl,
    thumbnailUrl,
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
  
  // Update file if uploaded
  if (req.files && req.files.file) {
    // Delete old file if exists
    if (worksheet.fileUrl) {
      const oldFilePath = path.join(__dirname, '../../', worksheet.fileUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Set new file URL
    worksheet.fileUrl = `/uploads/worksheets/${req.files.file[0].filename}`;
  }
  
  // Update thumbnail if uploaded
  if (req.files && req.files.thumbnail) {
    // Delete old thumbnail if exists
    if (worksheet.thumbnailUrl) {
      const oldThumbnailPath = path.join(__dirname, '../../', worksheet.thumbnailUrl);
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
    }
    
    // Set new thumbnail URL
    worksheet.thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
  }
  
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
  
  // Delete files
  if (worksheet.fileUrl) {
    const filePath = path.join(__dirname, '../../', worksheet.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  
  if (worksheet.thumbnailUrl) {
    const thumbnailPath = path.join(__dirname, '../../', worksheet.thumbnailUrl);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
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
exports.downloadWorksheet = asyncHandler(async (req, res) => {
  const worksheet = await Worksheet.findById(req.params.id);
  
  if (!worksheet) {
    throw new APIError('Worksheet not found', 404);
  }
  
  // Check user's subscription level
  const user = await User.findById(req.user.id).populate('activeSubscription');
  
  // Get user's subscription level
  let userSubscriptionLevel = 'Free';
  if (user.activeSubscription && user.activeSubscription.status === 'active') {
    const subscription = await Subscription.findById(user.activeSubscription)
      .populate('plan');
    
    if (subscription && subscription.plan) {
      userSubscriptionLevel = subscription.plan.name;
    }
  }
  
  // Check if user can access this worksheet based on subscription level
  const subscriptionLevels = ['Free', 'Essential', 'Premium'];
  const worksheetLevelIndex = subscriptionLevels.indexOf(worksheet.subscriptionLevel);
  const userLevelIndex = subscriptionLevels.indexOf(userSubscriptionLevel);
  
  if (userLevelIndex < worksheetLevelIndex) {
    throw new APIError(`You need a ${worksheet.subscriptionLevel} subscription to download this worksheet`, 403);
  }
  
  // Check download limits
  if (userSubscriptionLevel !== 'Premium') {
    // Get user's download count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const downloadCount = user.downloadHistory.filter(download => {
      const downloadDate = new Date(download.downloadedAt);
      return downloadDate >= today;
    }).length;
    
    // Check against limits
    const limits = {
      Free: 3,
      Essential: 10
    };
    
    if (downloadCount >= limits[userSubscriptionLevel]) {
      throw new APIError(`You have reached your daily download limit for ${userSubscriptionLevel} subscription`, 403);
    }
  }
  
  // Track download
  user.downloadHistory.push({
    worksheet: worksheet._id,
    downloadedAt: Date.now()
  });
  
  await user.save();
  
  // Increment download count
  worksheet.downloads += 1;
  await worksheet.save();
  
  // Return download URL
  res.json({
    success: true,
    data: {
      downloadUrl: worksheet.fileUrl
    }
  });
});
