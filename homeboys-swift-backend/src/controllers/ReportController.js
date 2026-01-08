// src/controllers/ReportController.js
const mongoose = require('mongoose');

exports.getSummary = async (req, res) => {
    try {
        const User = mongoose.model('User');
        const Booking = mongoose.model('Booking');
        const Trip = mongoose.model('Trip');
        const Bus = mongoose.model('Bus');

        const [usersCount, bookingsCount, tripsCount, busesCount] = await Promise.all([
            User.countDocuments({}),
            Booking.countDocuments({}),
            Trip.countDocuments({}),
            Bus.countDocuments({})
        ]);

        res.status(200).json({ usersCount, bookingsCount, tripsCount, busesCount });
    } catch (err) {
        console.error('Report error', err);
        res.status(500).json({ message: 'Error generating report.' });
    }
};
