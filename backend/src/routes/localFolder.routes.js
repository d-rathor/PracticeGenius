const express = require('express');
const router = express.Router();
const { 
  processLocalFolder,
  processBatchUpload
} = require('../controllers/localFolder.controller');
const { protect: auth, authorize } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for batch uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 50 // Maximum 50 files at once
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * @route   POST /api/local-folder/process
 * @desc    Process all PDF files in a local folder
 * @access  Private/Admin
 */
router.post('/process', auth, authorize('admin'), processLocalFolder);

/**
 * @route   POST /api/local-folder/upload-batch
 * @desc    Process multiple files uploaded through the form
 * @access  Private/Admin
 */
router.post('/upload-batch', auth, authorize('admin'), upload.array('worksheetFiles', 50), processBatchUpload);

module.exports = router;
