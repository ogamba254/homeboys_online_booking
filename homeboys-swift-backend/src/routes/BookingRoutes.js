// src/routes/BookingRoutes.js
const express = require('express');
const bookingController = require('../controllers/BookingController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, bookingController.createBooking);
router.get('/my-bookings', authenticateToken, bookingController.getUserBookings);
router.get('/all', requireAdmin, bookingController.getAllBookings);

module.exports = router;