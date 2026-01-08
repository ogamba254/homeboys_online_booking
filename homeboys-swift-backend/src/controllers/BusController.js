// src/controllers/BusController.js
const BusModel = require('../models/BusModel');

exports.createBus = async (req, res) => {
    try {
        const bus = await BusModel.createBus(req.body);
        res.status(201).json(bus);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Bus plate number already exists.' });
        }
        res.status(500).json({ message: 'Error creating bus.', error: error.message });
    }
};

exports.getAllBuses = async (req, res) => {
    try {
        const buses = await BusModel.findAllBuses();
        res.status(200).json(buses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching buses.', error: error.message });
    }
};

exports.updateBus = async (req, res) => {
    try {
        const bus_id = req.params.id;
        const bus = await BusModel.updateBus(bus_id, req.body);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found.' });
        }
        res.status(200).json(bus);
    } catch (error) {
        res.status(500).json({ message: 'Error updating bus.', error: error.message });
    }
};

exports.deleteBus = async (req, res) => {
    try {
        const bus_id = req.params.id;
        const deletedBus = await BusModel.deleteBus(bus_id);
        if (!deletedBus) {
            return res.status(404).json({ message: 'Bus not found.' });
        }
        res.status(204).send();
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ message: 'Cannot delete bus: It is assigned to scheduled trips.' });
        }
        res.status(500).json({ message: 'Error deleting bus.', error: error.message });
    }
};