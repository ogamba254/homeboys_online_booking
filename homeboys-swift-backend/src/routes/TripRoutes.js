// src/routes/TripRoutes.js
const express = require('express');
const tripController = require('../controllers/TripController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', tripController.searchTrips); // Public Search
router.post('/', requireAdmin, tripController.createTrip);
router.put('/:id', requireAdmin, tripController.updateTrip);

module.exports = router;