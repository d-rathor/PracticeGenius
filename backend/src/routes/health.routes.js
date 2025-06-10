const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 * Handles both /health and /:port/health for Render's health checks
 */
const healthCheck = (req, res) => {
  res.status(200).set('Content-Type', 'text/plain').send('OK');
};

// Handle both /health and /:port/health
router.get('/health', healthCheck);
router.get('/:port/health', healthCheck);

module.exports = router;
