const mongoose = require('mongoose');

const UserWorksheetLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  worksheet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worksheet',
    required: true,
  },
  firstDownloadedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Compound unique index to ensure only one entry per user per worksheet
UserWorksheetLogSchema.index({ user: 1, worksheet: 1 }, { unique: true });

module.exports = mongoose.model('UserWorksheetLog', UserWorksheetLogSchema);
