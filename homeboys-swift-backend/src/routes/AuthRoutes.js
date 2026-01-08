// src/routes/AuthRoutes.js
const express = require('express');
const authController = require('../controllers/AuthController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/users', requireAdmin, authController.getAllUsers);

module.exports = router;