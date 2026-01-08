// src/routes/RouteRoutes.js
const express = require('express');
const routeController = require('../controllers/RouteController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', routeController.getAllRoutes); // Public
router.post('/', requireAdmin, routeController.createRoute);
router.put('/:id', requireAdmin, routeController.updateRoute);
router.delete('/:id', requireAdmin, routeController.deleteRoute);

module.exports = router;