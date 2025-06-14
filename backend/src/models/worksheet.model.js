const mongoose = require('mongoose');

const worksheetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    trim: true
  },
  subscriptionLevel: {
    type: String,
    enum: ['Free', 'Essential', 'Premium'],
    default: 'Free',
    required: [true, 'Subscription level is required']
  },
  keywords: [{
    type: String,
    trim: true
  }],
  // Fields for Backblaze B2 file storage
  fileKey: { // Object key in B2, e.g., worksheets/timestamp-filename.pdf
    type: String,
    trim: true
    // Not strictly required here as it's set by upload logic, but good to define
  },
  fileUrl: { // Full URL to the file in B2 (often referred to as 'location' by multer-s3)
    type: String,
    trim: true,
    required: [true, 'File URL is required after upload']
  },
  originalFilename: {
    type: String,
    trim: true
  },
  mimeType: { // e.g., application/pdf, image/jpeg
    type: String,
    trim: true
  },
  fileSize: { // Size in bytes
    type: Number
  },
  thumbnailUrl: {
    type: String,
    default: '/assets/default-worksheet-thumbnail.png'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for download count
worksheetSchema.virtual('downloadCount').get(function() {
  return this.downloads || 0;
});

// Index for search functionality
worksheetSchema.index({ title: 'text', description: 'text', keywords: 'text' });

// Pre-save middleware
worksheetSchema.pre('save', function(next) {
  // Ensure keywords are unique
  if (this.keywords && this.keywords.length > 0) {
    this.keywords = [...new Set(this.keywords)];
  }
  next();
});

const Worksheet = mongoose.model('Worksheet', worksheetSchema);

module.exports = Worksheet;
