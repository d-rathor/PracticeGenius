const express = require('express');
const router = express.Router();
const { 
  storeAuthToken,
  listFolderContents,
  processFile,
  processFolderBatch
} = require('../controllers/googleDrive.controller');
const { protect: auth, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/google-drive/auth
 * @desc    Store Google Drive authorization token
 * @access  Private/Admin
 */
router.post('/auth', auth, authorize('admin'), storeAuthToken);

/**
 * @route   GET /api/google-drive/list-folder/:folderId
 * @desc    List files in a Google Drive folder
 * @access  Private/Admin
 */
router.get('/list-folder/:folderId', auth, authorize('admin'), listFolderContents);

/**
 * @route   POST /api/google-drive/process-file
 * @desc    Process a single file from Google Drive
 * @access  Private/Admin
 */
router.post('/process-file', auth, authorize('admin'), processFile);

/**
 * @route   POST /api/google-drive/process-folder
 * @desc    Process multiple files from a Google Drive folder
 * @access  Private/Admin
 */
router.post('/process-folder', auth, authorize('admin'), processFolderBatch);

module.exports = router;
