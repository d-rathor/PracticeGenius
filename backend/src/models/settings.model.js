const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Settings type is required'],
    enum: ['subscription', 'site', 'email', 'payment'],
    unique: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Settings data is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  timestamps: true
});

// Pre-save middleware to ensure data is properly structured
settingsSchema.pre('save', function(next) {
  // Validate subscription settings
  if (this.type === 'subscription') {
    const requiredFields = ['plans'];
    
    for (const field of requiredFields) {
      if (!this.data[field]) {
        return next(new Error(`Subscription settings must include ${field}`));
      }
    }
    
    // Ensure plans have required fields
    if (Array.isArray(this.data.plans)) {
      for (const plan of this.data.plans) {
        if (!plan.name || !plan.price) {
          return next(new Error('Each subscription plan must have a name and price'));
        }
      }
    }
  }
  
  // Validate site settings
  if (this.type === 'site') {
    const requiredFields = ['siteName', 'contactEmail'];
    
    for (const field of requiredFields) {
      if (!this.data[field]) {
        return next(new Error(`Site settings must include ${field}`));
      }
    }
  }
  
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
