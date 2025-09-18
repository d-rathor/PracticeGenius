const express = require('express');
const { generateWorksheetDsl } = require('../controllers/worksheet.dsl.controller');
const auth = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

// Generate worksheet using DSL approach
router.post('/generate', auth(), adminAuth(), generateWorksheetDsl);

module.exports = router;
