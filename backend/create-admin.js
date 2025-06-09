const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const { MONGODB_URI } = require('./src/config/env');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists:');
      console.log(`Email: ${adminExists.email}`);
      console.log('You can login with this email and your password');
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@practicegenius.com',
        password: 'admin123',
        role: 'admin'
      });
      
      console.log('Admin user created successfully:');
      console.log(`Email: ${admin.email}`);
      console.log('Password: admin123');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdminUser();
