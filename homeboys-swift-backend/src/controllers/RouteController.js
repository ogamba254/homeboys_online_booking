// src/controllers/RouteController.js
const RouteModel = require('../models/RouteModel');

exports.createRoute = async (req, res) => {
    try {
        const route = await RouteModel.createRoute(req.body);
        res.status(201).json(route);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Route already exists.' });
        }
        res.status(500).json({ message: 'Error creating route.', error: error.message });
    }
};

exports.getAllRoutes = async (req, res) => {
    try {
        const routes = await RouteModel.findAllRoutes();
        res.status(200).json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching routes.', error: error.message });
    }
};

exports.updateRoute = async (req, res) => {
    try {
        const route_id = req.params.id;
        const route = await RouteModel.updateRoute(route_id, req.body);
        if (!route) {
            return res.status(404).json({ message: 'Route not found.' });
        }
        res.status(200).json(route);
    } catch (error) {
        res.status(500).json({ message: 'Error updating route.', error: error.message });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        const route_id = req.params.id;
        const deletedRoute = await RouteModel.deleteRoute(route_id);
        if (!deletedRoute) {
            return res.status(404).json({ message: 'Route not found.' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting route.', error: error.message });
    }
};