require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Initialize express app
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://devendrarathor:AUhkNDOr3164jhct@practicegenius.leeblag.mongodb.net/?retryWrites=true&w=majority&appName=PracticeGenius';

// Basic routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Practice Genius API',
    version: '1.0.0',
    mongoDbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API health check',
    timestamp: new Date().toISOString(),
    mongoDbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server first, then try MongoDB connection
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  
  console.log(`Attempting to connect to MongoDB Atlas...`);
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB Atlas connected successfully');
      
      // Mount routes after successful MongoDB connection
      try {
        // Import auth routes
        const authRoutes = require('./src/routes/auth.routes');
        app.use('/api/auth', authRoutes);
        console.log('Auth routes mounted successfully');
        
        // Import subscription plan routes
        const subscriptionPlanRoutes = require('./src/routes/subscription-plan.routes');
        app.use('/api/subscription-plans', subscriptionPlanRoutes);
        console.log('Subscription plan routes mounted successfully');
        
        // Import other routes as needed
        console.log('All available routes mounted successfully');
      } catch (error) {
        console.error('Error mounting routes:', error);
      }
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Running server without MongoDB connection. Only basic routes will work.');
    });
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Keep the process alive
console.log('Server process will remain active until manually terminated');
process.stdin.resume();

// Handle errors to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Don't exit the process
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  // Don't exit the process
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed.');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  }).catch(() => {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
});
