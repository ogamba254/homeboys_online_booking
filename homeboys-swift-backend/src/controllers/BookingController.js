// src/controllers/BookingController.js
const BookingModel = require('../models/BookingModel');
const mongoose = require('mongoose');

exports.createBooking = async (req, res) => {
    const user_id = req.user.user_id; 
    const { trip_id, seat_number, price_paid } = req.body;

    // Validate trip_id is a valid Mongo ObjectId
    if (!trip_id || !mongoose.Types.ObjectId.isValid(String(trip_id))) {
        return res.status(400).json({ message: 'Invalid trip_id. Must be a MongoDB ObjectId.' });
    }

    if (!trip_id || !seat_number || !price_paid) {
        return res.status(400).json({ message: 'Missing trip, seat, or price information.' });
    }

    const finalPrice = parseFloat(price_paid);
    if (isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ message: 'Invalid price amount.' });
    }

    try {
        const newBooking = await BookingModel.createBooking({
            trip_id,
            user_id,
            seat_number,
            price_paid: finalPrice,
        });

        res.status(201).json({ 
            message: 'Booking successful!', 
            booking: newBooking 
        });
    } catch (error) {
        console.error('Booking creation error:', error.message);
        if (error.message.includes('Seat') || error.message.includes('seats available') || error.message.includes('Trip')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Could not process booking due to a server error.' });
    }
};

exports.getUserBookings = async (req, res) => {
    const user_id = req.user.user_id; 

    try {
        const bookings = await BookingModel.findBookingsByUser(user_id);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user bookings.' });
    }
};

// Admin: list all bookings with basic joins
exports.getAllBookings = async (req, res) => {
    try {
        const Booking = require('../models/BookingModel');
        // Re-use BookingModel aggregation used for user but without match
        const mongoose = require('mongoose');
        const Book = mongoose.model('Booking');

        const pipeline = [
            { $lookup: { from: 'trips', localField: 'trip_id', foreignField: '_id', as: 'trip' } },
            { $unwind: '$trip' },
            { $lookup: { from: 'routes', localField: 'trip.route_id', foreignField: '_id', as: 'route' } },
            { $unwind: '$route' },
            { $lookup: { from: 'buses', localField: 'trip.bus_id', foreignField: '_id', as: 'bus' } },
            { $unwind: '$bus' },
            { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: {
                booking_id: '$_id', booking_reference: 1, status: 1, seat_number: 1, price_paid: 1,
                'date': '$trip.date', 'departure_time': '$trip.departure_time',
                'origin': '$route.origin', 'destination': '$route.destination',
                'plate_number': '$bus.plate_number', 'user_email': '$user.email'
            }} ,
            { $sort: { date: -1, departure_time: -1 } }
        ];

        const results = await Book.aggregate(pipeline);
        res.status(200).json(results.map(r => ({ ...r, booking_id: r.booking_id.toString() })));
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings.' });
    }
};