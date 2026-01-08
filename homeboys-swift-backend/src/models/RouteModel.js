// src/models/RouteModel.js (Mongoose)
const mongoose = require('../config/db');
const { Schema } = mongoose;

const RouteSchema = new Schema({
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    base_price: { type: Number, required: true }
}, { timestamps: true });

const Route = mongoose.model('Route', RouteSchema);

class RouteModel {
    static async createRoute({ origin, destination, base_price, default_departure_time = '09:00', publish_days = 7 }) {
        const doc = await Route.create({ origin, destination, base_price });
        const obj = doc.toObject();
        obj.route_id = obj._id.toString();

        // After creating a route, create placeholder trips for the next `publish_days` days
        // so the client sees the route immediately. Use the first active bus if available.
            try {
            require('./TripModel');
            const TripModel = require('./TripModel');
            // Ensure Bus model is registered
            require('./BusModel');
            const Bus = mongoose.model('Bus');
            const bus = await Bus.findOne({ status: 'active' }).lean();
            if (bus) {
                const today = new Date();
                for (let i = 0; i < Number(publish_days || 0); i++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() + i);
                    try {
                        await TripModel.createTrip({ route_id: doc._id, bus_id: bus._id, departure_time: default_departure_time, date: d, price: base_price });
                    } catch (err) {
                        console.error('Failed to create placeholder trip for route:', err.message);
                    }
                }
            }
        } catch (err) {
            console.error('Error creating placeholder trips for new route:', err.message);
        }

        return obj;
    }

    static async findAllRoutes() {
        const docs = await Route.find({}).sort({ origin: 1, destination: 1 }).lean();
        return docs.map(d => ({ ...d, route_id: d._id.toString() }));
    }

    static async findRouteById(route_id) {
        const doc = await Route.findById(route_id).lean();
        if (!doc) return null;
        doc.route_id = doc._id.toString();
        return doc;
    }

    static async updateRoute(route_id, { origin, destination, base_price }) {
        const doc = await Route.findByIdAndUpdate(route_id, { origin, destination, base_price }, { new: true }).lean();
        if (!doc) return null;

        // Cascade the new base_price to future Trip documents for this route
        try {
            // Ensure the Trip model is registered with mongoose before using it.
            // Require the TripModel file which registers the model if not already.
            require('./TripModel');
            const Trip = mongoose.model('Trip');
            const dayStart = new Date();
            dayStart.setHours(0,0,0,0);
            await Trip.updateMany(
                { route_id: doc._id, date: { $gte: dayStart } },
                { $set: { price: base_price } }
            );
        } catch (err) {
            // Log but don't fail the route update if cascading fails
            console.error('Failed to cascade route base_price to trips:', err);
        }

        doc.route_id = doc._id.toString();
        return doc;
    }

    static async deleteRoute(route_id) {
        const doc = await Route.findByIdAndDelete(route_id).lean();
        if (!doc) return null;
        return { route_id: doc._id.toString() };
    }
}

module.exports = RouteModel;