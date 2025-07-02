require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
// These will be created later
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const worksheetRoutes = require('./src/routes/worksheet.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const subscriptionPlanRoutes = require('./src/routes/subscription-plan.routes');

// Initialize express app
const app = express();

// Set port
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet()); // Security headers

// Add this block for debugging environment variables in production
console.log('--- Environment Variable Debug ---');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`CORS_ORIGIN read from environment: ${process.env.CORS_ORIGIN}`);
console.log('------------------------------------');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Practice Genius API' });
});

// API routes will be added here
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/worksheets', worksheetRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
const { errorHandler } = require('./src/middleware/error'); // Ensure this path is correct
console.log('[Server.js] Type of imported errorHandler:', typeof errorHandler, errorHandler ? errorHandler.name : 'N/A'); // Log type and name
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});
