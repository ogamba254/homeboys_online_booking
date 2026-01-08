// src/models/TripModel.js (Mongoose)
const mongoose = require('../config/db');
const { Schema } = mongoose;

const TripSchema = new Schema({
    route_id: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    bus_id: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    departure_time: { type: String, required: true },
    date: { type: Date, required: true },
    price: { type: Number, required: true },
    available_seats: { type: Number, required: true }
}, { timestamps: true });

const Trip = mongoose.model('Trip', TripSchema);

class TripModel {
    static async createTrip({ route_id, bus_id, departure_time, date, price }) {
        const Bus = mongoose.model('Bus');
        const bus = await Bus.findById(bus_id).lean();
        if (!bus) throw new Error('Bus not found.');
        const capacity = bus.capacity;

        const created = await Trip.create({
            route_id,
            bus_id,
            departure_time,
            date: new Date(date),
            price,
            available_seats: capacity
        });
        const obj = created.toObject();
        obj.trip_id = obj._id.toString();
        return obj;
    }

    static async searchTrips({ origin, destination, date }) {
        const Route = mongoose.model('Route');
        const Bus = mongoose.model('Bus');

        const dayStart = new Date(date);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const pipeline = [
            { $match: { date: { $gte: dayStart, $lt: dayEnd }, available_seats: { $gt: 0 } } },
            { $lookup: { from: 'routes', localField: 'route_id', foreignField: '_id', as: 'route' } },
            { $unwind: '$route' },
            { $lookup: { from: 'buses', localField: 'bus_id', foreignField: '_id', as: 'bus' } },
            { $unwind: '$bus' },
            { $match: { 'route.origin': { $regex: origin, $options: 'i' }, 'route.destination': { $regex: destination, $options: 'i' } } },
            { $sort: { departure_time: 1 } },
            { $project: {
                trip_id: '$_id', date: 1, departure_time: 1, price: 1, available_seats: 1,
                'route.origin': 1, 'route.destination': 1, 'route.base_price': 1,
                'bus.plate_number': 1, 'bus.model': 1, 'bus.capacity': 1
            } }
        ];

        const results = await Trip.aggregate(pipeline);
        if ((!results || results.length === 0) && origin && destination) {
            const fallbackPipeline = [
                { $match: { date: { $gte: dayStart, $lt: dayEnd }, available_seats: { $gt: 0 } } },
                { $lookup: { from: 'routes', localField: 'route_id', foreignField: '_id', as: 'route' } },
                { $unwind: '$route' },
                { $lookup: { from: 'buses', localField: 'bus_id', foreignField: '_id', as: 'bus' } },
                { $unwind: '$bus' },
                { $sort: { departure_time: 1 } },
                { $project: {
                    trip_id: '$_id', date: 1, departure_time: 1, price: 1, available_seats: 1,
                    'route.origin': 1, 'route.destination': 1, 'route.base_price': 1,
                    'bus.plate_number': 1, 'bus.model': 1, 'bus.capacity': 1
                } }
            ];

            const fallbackResults = await Trip.aggregate(fallbackPipeline);
            if (fallbackResults && fallbackResults.length > 0) return fallbackResults.map(r => ({
                trip_id: r.trip_id.toString(),
                date: r.date,
                departure_time: r.departure_time,
                price: (typeof r.price !== 'undefined' && r.price !== null) ? r.price : r.route.base_price,
                available_seats: r.available_seats,
                origin: r.route.origin,
                destination: r.route.destination,
                base_price: r.route.base_price,
                plate_number: r.bus.plate_number,
                model: r.bus.model,
                capacity: r.bus.capacity
            }));
        }

        return results.map(r => ({
            trip_id: r.trip_id.toString(),
            date: r.date,
            departure_time: r.departure_time,
            price: (typeof r.price !== 'undefined' && r.price !== null) ? r.price : r.route.base_price,
            available_seats: r.available_seats,
            origin: r.route.origin,
            destination: r.route.destination,
            base_price: r.route.base_price,
            plate_number: r.bus.plate_number,
            model: r.bus.model,
            capacity: r.bus.capacity
        }));
    }

    static async updateTrip(trip_id, { price, departure_time, date, available_seats }) {
        const updateFields = {};
        if (typeof price !== 'undefined') updateFields.price = price;
        if (typeof departure_time !== 'undefined') updateFields.departure_time = departure_time;
        if (typeof date !== 'undefined') updateFields.date = new Date(date);
        if (typeof available_seats !== 'undefined') updateFields.available_seats = available_seats;

        const doc = await Trip.findByIdAndUpdate(trip_id, updateFields, { new: true }).lean();
        if (!doc) return null;

        return {
            trip_id: doc._id.toString(),
            route_id: doc.route_id,
            bus_id: doc.bus_id,
            departure_time: doc.departure_time,
            date: doc.date,
            price: doc.price,
            available_seats: doc.available_seats
        };
    }
}

module.exports = TripModel;