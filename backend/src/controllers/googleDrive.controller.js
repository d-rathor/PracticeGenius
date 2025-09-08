const { initDriveClient, storeToken } = require('../utils/googleDriveAuth');
const { extractPdfMetadata } = require('../utils/pdfMetadataExtractor');
const { uploadToB2 } = require('../utils/b2Uploader');
const { generatePdfPreview } = require('../utils/pdfPreviewGenerator');
const asyncHandler = require('../utils/async-handler');
const { APIError } = require('../middleware/error');
const Worksheet = require('../models/worksheet.model');
const path = require('path');

/**
 * Store Google Drive authorization token
 * @route POST /api/google-drive/auth
 * @access Private/Admin
 */
exports.storeAuthToken = asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    throw new APIError('Authorization code is required', 400);
  }
  
  await storeToken(code);
  
  res.json({
    success: true,
    message: 'Google Drive authorization successful'
  });
});

/**
 * List files in a Google Drive folder
 * @route GET /api/google-drive/list-folder/:folderId
 * @access Private/Admin
 */
exports.listFolderContents = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  
  if (!folderId) {
    throw new APIError('Folder ID is required', 400);
  }
  
  const drive = await initDriveClient();
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/pdf'`,
    fields: 'files(id, name, mimeType, webContentLink, createdTime, modifiedTime, size)'
  });
  
  const files = response.data.files;
  
  res.json({
    success: true,
    data: files || []
  });
});

/**
 * Process a single file from Google Drive
 * @route POST /api/google-drive/process-file
 * @access Private/Admin
 */
exports.processFile = asyncHandler(async (req, res) => {
  const { fileId } = req.body;
  
  if (!fileId) {
    throw new APIError('File ID is required', 400);
  }
  
  const drive = await initDriveClient();
  
  // Get file metadata
  const fileMetadata = await drive.files.get({
    fileId,
    fields: 'name,mimeType,size'
  });
  
  if (fileMetadata.data.mimeType !== 'application/pdf') {
    throw new APIError('Only PDF files are supported', 400);
  }
  
  // Download file content
  const fileResponse = await drive.files.get({
    fileId,
    alt: 'media'
  }, { responseType: 'arraybuffer' });
  
  const fileBuffer = Buffer.from(fileResponse.data);
  
  // Extract metadata from PDF
  const metadata = await extractPdfMetadata(fileBuffer);
  
  // 1. Upload the original file to B2
  const { fileUrl, fileKey } = await uploadToB2(
    fileBuffer,
    fileMetadata.data.name,
    fileMetadata.data.mimeType,
    'worksheets'
  );
  
  let previewUrl, previewKey;
  
  // 2. Generate and upload a preview
  const previewBuffer = await generatePdfPreview(fileBuffer);
  if (previewBuffer) {
    const previewData = await uploadToB2(
      previewBuffer,
      `${path.parse(fileMetadata.data.name).name}.png`,
      'image/png',
      'previews'
    );
    previewUrl = previewData.fileUrl;
    previewKey = previewData.fileKey;
  }
  
  // 3. Create worksheet entry in the database
  const worksheet = await Worksheet.create({
    title: metadata.title,
    description: metadata.description,
    subject: metadata.subject,
    grade: metadata.grade,
    subscriptionLevel: metadata.subscriptionLevel,
    keywords: metadata.keywords,
    fileUrl,
    fileKey,
    previewUrl,
    previewKey,
    originalFilename: fileMetadata.data.name,
    mimeType: fileMetadata.data.mimeType,
    fileSize: fileMetadata.data.size,
    createdBy: req.user.id,
  });
  
  await worksheet.populate('createdBy', 'name email');
  
  res.status(201).json({
    success: true,
    data: worksheet,
  });
});

/**
 * Process multiple files from a Google Drive folder
 * @route POST /api/google-drive/process-folder
 * @access Private/Admin
 */
exports.processFolderBatch = asyncHandler(async (req, res) => {
  const { folderId } = req.body;
  
  if (!folderId) {
    throw new APIError('Google Drive folder ID is required', 400);
  }
  
  // Initialize Google Drive client
  const drive = await initDriveClient();
  
  // List files in the folder
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/pdf'`,
    fields: 'files(id, name, mimeType)'
  });
  
  const files = response.data.files;
  
  if (!files || files.length === 0) {
    return res.json({
      success: true,
      message: 'No PDF files found in the specified folder',
      data: []
    });
  }
  
  // Process each file
  const results = [];
  
  for (const file of files) {
    try {
      // Download file content
      const fileResponse = await drive.files.get({
        fileId: file.id,
        alt: 'media'
      }, { responseType: 'arraybuffer' });
      
      const fileBuffer = Buffer.from(fileResponse.data);
      
      // Extract metadata
      const metadata = await extractPdfMetadata(fileBuffer);
      
      // 1. Upload the original file to B2
      const { fileUrl, fileKey } = await uploadToB2(
        fileBuffer,
        file.name,
        file.mimeType,
        'worksheets'
      );
      
      let previewUrl, previewKey;
      
      // 2. Generate and upload a preview
      const previewBuffer = await generatePdfPreview(fileBuffer);
      if (previewBuffer) {
        const previewData = await uploadToB2(
          previewBuffer,
          `${path.parse(file.name).name}.png`,
          'image/png',
          'previews'
        );
        previewUrl = previewData.fileUrl;
        previewKey = previewData.fileKey;
      }
      
      // 3. Create worksheet entry in the database
      const worksheet = await Worksheet.create({
        title: metadata.title,
        description: metadata.description,
        subject: metadata.subject,
        grade: metadata.grade,
        subscriptionLevel: metadata.subscriptionLevel,
        keywords: metadata.keywords,
        fileUrl,
        fileKey,
        previewUrl,
        previewKey,
        originalFilename: file.name,
        mimeType: file.mimeType,
        fileSize: fileBuffer.length,
        createdBy: req.user.id,
      });
      
      results.push({
        fileId: file.id,
        fileName: file.name,
        metadata,
        success: true,
        worksheetId: worksheet._id
      });
      
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      results.push({
        fileId: file.id,
        fileName: file.name,
        success: false,
        error: error.message
      });
    }
  }
  
  res.json({
    success: true,
    message: `Processed ${results.filter(r => r.success).length} out of ${files.length} files`,
    data: results
  });
});
