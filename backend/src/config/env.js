require('dotenv').config();

/**
 * Environment configuration with validation
 */
const env = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080', 10),
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://devendrarathor:AUhkNDOr3164jhct@practicegenius.leeblag.mongodb.net/?retryWrites=true&w=majority&appName=PracticeGenius',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'practicegenius-dev-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Upload configuration
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads',
  
  // Validate required environment variables
  validate() {
    const required = ['JWT_SECRET'];
    
    for (const key of required) {
      if (!this[key]) {
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
      }
    }
  }
};

module.exports = env;
