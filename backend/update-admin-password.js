const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
require('dotenv').config();

async function updateAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // New password (change this to whatever you want)
    const newPassword = 'Vihaan%3810';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin user password
    const result = await User.updateOne(
      { email: 'admin@practicegenius.com', role: 'admin' },
      { password: hashedPassword }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('New credentials:');
      console.log('Email: admin@practicegenius.com');
      console.log('Password:', newPassword);
    } else {
      console.log('❌ Admin user not found or password not changed');
    }
    
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateAdminPassword();
