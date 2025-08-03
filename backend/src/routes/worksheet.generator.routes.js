const express = require('express');
const { generateWorksheet } = require('../controllers/worksheet.generator.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes in this file will be protected
router.use(protect);

router.route('/generate').post(generateWorksheet);

module.exports = router;
