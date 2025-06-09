const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { APIError } = require('./error');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads/worksheets'),
    path.join(__dirname, '../../uploads/thumbnails')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create upload directories
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on fieldname
    let uploadPath = path.join(__dirname, '../../uploads');
    
    if (file.fieldname === 'file') {
      uploadPath = path.join(uploadPath, 'worksheets');
    } else if (file.fieldname === 'thumbnail') {
      uploadPath = path.join(uploadPath, 'thumbnails');
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

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
