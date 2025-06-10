const express = require('express');
const router = express.Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).set('Content-Type', 'text/plain').send('OK');
});

module.exports = router;
