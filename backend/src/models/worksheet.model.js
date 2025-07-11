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
  fileKey: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    trim: true,
    required: [true, 'File URL is required after upload']
  },
  originalFilename: {
    type: String,
    trim: true
  },
  mimeType: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },
  thumbnailUrl: {
    type: String,
    default: '/assets/default-worksheet-thumbnail.png'
  },
  previewUrl: {
    type: String,
    trim: true
  },
  previewKey: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  downloads: {
    type: Number,
    default: 0
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
