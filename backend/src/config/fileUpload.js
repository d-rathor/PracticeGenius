const multer = require('multer');

// Define allowed MIME types for worksheets
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Use memory storage to hold the file buffer, allowing the controller to process it
// (e.g., for generating a preview) before uploading to a permanent store.
const storage = multer.memoryStorage();

// Configure multer with memory storage, file size limits, and a file filter.
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit, to accommodate larger PDFs
  },
  fileFilter: (req, file, cb) => {
    // The 'worksheetFile' check ensures we are validating the correct file.
    if (file.fieldname === 'worksheetFile' && allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      // Reject file with a specific error
      cb(new Error('Invalid file type or field name. Only PDF/Word documents are allowed in the \'worksheetFile\' field.'), false);
    }
  },
});

module.exports = upload;
