// src/routes/BusRoutes.js
const express = require('express');
const busController = require('../controllers/BusController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', busController.getAllBuses); // Public
router.post('/', requireAdmin, busController.createBus);
router.put('/:id', requireAdmin, busController.updateBus);
router.delete('/:id', requireAdmin, busController.deleteBus);

module.exports = router;