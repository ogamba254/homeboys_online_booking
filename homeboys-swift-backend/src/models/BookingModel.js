// src/models/BookingModel.js (Mongoose)
const mongoose = require('../config/db');
const { Schema } = mongoose;

const BookingSchema = new Schema({
    trip_id: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seat_number: { type: String, required: true },
    price_paid: { type: Number, required: true },
    booking_reference: { type: String, required: true, unique: true },
    status: { type: String, default: 'confirmed' }
}, { timestamps: true });

// Prevent duplicate seat bookings for same trip
BookingSchema.index({ trip_id: 1, seat_number: 1 }, { unique: true });

const Booking = mongoose.model('Booking', BookingSchema);

class BookingModel {
    static async createBooking(bookingData) {
        const { trip_id, user_id, seat_number, price_paid } = bookingData;

        // Generate a unique booking reference
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const refId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const booking_reference = `HBS-${datePart}-${refId}`;

        const Trip = mongoose.model('Trip');

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // 1. Ensure seat is not already taken (unique index will also protect)
            const existing = await Booking.findOne({ trip_id, seat_number, status: 'confirmed' }).session(session);
            if (existing) {
                throw new Error(`Seat ${seat_number} is already taken.`);
            }

            // 2. Atomically decrement available seats if > 0
            const updatedTrip = await Trip.findOneAndUpdate(
                { _id: trip_id, available_seats: { $gt: 0 } },
                { $inc: { available_seats: -1 } },
                { new: true, session }
            ).lean();

            if (!updatedTrip) {
                throw new Error('Trip not found or no seats available.');
            }

            // 3. Create booking
            const created = await Booking.create([{
                trip_id,
                user_id,
                seat_number,
                price_paid,
                booking_reference,
                status: 'confirmed'
            }], { session });

            await session.commitTransaction();
            session.endSession();

            const booking = created[0].toObject();
            booking.booking_id = booking._id.toString();
            return booking;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static async findBookingsByUser(user_id) {
        const Book = Booking;

        const pipeline = [
            { $match: { user_id: mongoose.Types.ObjectId(user_id) } },
            { $lookup: { from: 'trips', localField: 'trip_id', foreignField: '_id', as: 'trip' } },
            { $unwind: '$trip' },
            { $lookup: { from: 'routes', localField: 'trip.route_id', foreignField: '_id', as: 'route' } },
            { $unwind: '$route' },
            { $lookup: { from: 'buses', localField: 'trip.bus_id', foreignField: '_id', as: 'bus' } },
            { $unwind: '$bus' },
            { $project: {
                booking_id: '$_id', booking_reference: 1, status: 1, seat_number: 1, price_paid: 1,
                'date': '$trip.date', 'departure_time': '$trip.departure_time',
                'origin': '$route.origin', 'destination': '$route.destination',
                'plate_number': '$bus.plate_number'
            }},
            { $sort: { date: -1, departure_time: -1 } }
        ];

        const results = await Book.aggregate(pipeline);
        return results.map(r => ({
            ...r,
            booking_id: r.booking_id.toString()
        }));
    }
}

module.exports = BookingModel;