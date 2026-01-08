// src/routes/ReportRoutes.js
const express = require('express');
const reportController = require('../controllers/ReportController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', requireAdmin, reportController.getSummary);

module.exports = router;
