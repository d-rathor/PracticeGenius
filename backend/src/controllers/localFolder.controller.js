const fs = require('fs').promises;
const path = require('path');
const { extractPdfMetadata } = require('../utils/pdfMetadataExtractor');
const { uploadToB2 } = require('../utils/b2Uploader');
const { generatePdfPreview } = require('../utils/pdfPreviewGenerator');
const asyncHandler = require('../utils/async-handler');
const { APIError } = require('../middleware/error');
const Worksheet = require('../models/worksheet.model');

/**
 * Process all PDF files in a local folder
 * @route POST /api/local-folder/process
 * @access Private/Admin
 */
exports.processLocalFolder = asyncHandler(async (req, res) => {
  const { folderPath } = req.body;
  
  if (!folderPath) {
    throw new APIError('Local folder path is required', 400);
  }
  
  try {
    // Check if folder exists
    await fs.access(folderPath);
  } catch (error) {
    throw new APIError(`Folder not found or not accessible: ${folderPath}`, 404);
  }
  
  // Get all files in the folder
  const files = await fs.readdir(folderPath);
  
  // Filter for PDF files
  const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
  
  if (pdfFiles.length === 0) {
    return res.json({
      success: true,
      message: 'No PDF files found in the specified folder',
      data: []
    });
  }
  
  // Process each PDF file
  const results = [];
  
  for (const file of pdfFiles) {
    try {
      const filePath = path.join(folderPath, file);
      
      // Read file content
      const fileBuffer = await fs.readFile(filePath);
      
      // Extract metadata from PDF
      const metadata = await extractPdfMetadata(fileBuffer);
      
      // 1. Upload the original file to B2
      const { fileUrl, fileKey } = await uploadToB2(
        fileBuffer,
        file,
        'application/pdf',
        'worksheets'
      );
      
      let previewUrl, previewKey;
      
      // 2. Generate and upload a preview
      const previewBuffer = await generatePdfPreview(fileBuffer);
      if (previewBuffer) {
        const previewData = await uploadToB2(
          previewBuffer,
          `${path.parse(file).name}.png`,
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
        originalFilename: file,
        mimeType: 'application/pdf',
        fileSize: fileBuffer.length,
        createdBy: req.user.id,
      });
      
      results.push({
        fileName: file,
        metadata,
        success: true,
        worksheetId: worksheet._id
      });
      
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      results.push({
        fileName: file,
        success: false,
        error: error.message
      });
    }
  }
  
  res.json({
    success: true,
    message: `Processed ${results.filter(r => r.success).length} out of ${pdfFiles.length} files`,
    data: results
  });
});

/**
 * Process multiple files uploaded through the form
 * @route POST /api/local-folder/upload-batch
 * @access Private/Admin
 */
exports.processBatchUpload = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new APIError('No files uploaded', 400);
  }
  
  const results = [];
  
  for (const file of req.files) {
    try {
      // Extract metadata from PDF
      const metadata = await extractPdfMetadata(file.buffer);
      
      // 1. Upload the original file to B2
      const { fileUrl, fileKey } = await uploadToB2(
        file.buffer,
        file.originalname,
        file.mimetype,
        'worksheets'
      );
      
      let previewUrl, previewKey;
      
      // 2. Generate and upload a preview if it's a PDF
      if (file.mimetype === 'application/pdf') {
        const previewBuffer = await generatePdfPreview(file.buffer);
        if (previewBuffer) {
          const previewData = await uploadToB2(
            previewBuffer,
            `${path.parse(file.originalname).name}.png`,
            'image/png',
            'previews'
          );
          previewUrl = previewData.fileUrl;
          previewKey = previewData.fileKey;
        }
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
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        createdBy: req.user.id,
      });
      
      results.push({
        fileName: file.originalname,
        metadata,
        success: true,
        worksheetId: worksheet._id
      });
      
    } catch (error) {
      console.error(`Error processing file ${file.originalname}:`, error);
      results.push({
        fileName: file.originalname,
        success: false,
        error: error.message
      });
    }
  }
  
  res.json({
    success: true,
    message: `Processed ${results.filter(r => r.success).length} out of ${req.files.length} files`,
    data: results
  });
});
