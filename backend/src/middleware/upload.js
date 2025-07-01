const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { APIError } = require('./error');

// Configure storage to be in-memory
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedFileTypes = {
    file: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'],
    thumbnail: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  };
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check if file type is allowed based on fieldname
  if (file.fieldname === 'file' && allowedFileTypes.file.includes(ext)) {
    cb(null, true);
  } else if (file.fieldname === 'thumbnail' && allowedFileTypes.thumbnail.includes(ext)) {
    cb(null, true);
  } else {
    cb(new APIError(`File type ${ext} is not allowed for ${file.fieldname}`, 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

module.exports = upload;
