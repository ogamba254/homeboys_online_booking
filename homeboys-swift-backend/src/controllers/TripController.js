// src/controllers/TripController.js
const TripModel = require('../models/TripModel');

exports.createTrip = async (req, res) => {
    try {
        const trip = await TripModel.createTrip(req.body);
        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ message: 'Error creating trip schedule.', error: error.message });
    }
};

exports.searchTrips = async (req, res) => {
    try {
        const { origin, destination, date } = req.query;
        if (!origin || !destination || !date) {
            return res.status(400).json({ message: 'Missing search parameters (origin, destination, date).' });
        }
        
        const trips = await TripModel.searchTrips({ origin, destination, date });
        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for trips.', error: error.message });
    }
};

exports.updateTrip = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { price, departure_time, date, available_seats } = req.body;
        const update = {};
        if (typeof price !== 'undefined') update.price = Number(price);
        if (typeof departure_time !== 'undefined') update.departure_time = departure_time;
        if (typeof date !== 'undefined') update.date = date;
        if (typeof available_seats !== 'undefined') update.available_seats = Number(available_seats);

        const trip = await require('../models/TripModel').updateTrip(tripId, update);
        if (!trip) return res.status(404).json({ message: 'Trip not found.' });
        res.status(200).json(trip);
    } catch (error) {
        res.status(500).json({ message: 'Error updating trip.', error: error.message });
    }
};