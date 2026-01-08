// src/models/BusModel.js (Mongoose)
const mongoose = require('../config/db');
const { Schema } = mongoose;

const BusSchema = new Schema({
    plate_number: { type: String, required: true, unique: true, index: true },
    capacity: { type: Number, required: true },
    model: { type: String },
    status: { type: String, default: 'active' }
}, { timestamps: true });

const Bus = mongoose.model('Bus', BusSchema);

class BusModel {
    static async createBus({ plate_number, capacity, model }) {
        const doc = await Bus.create({ plate_number, capacity, model });
        const obj = doc.toObject();
        obj.bus_id = obj._id.toString();
        return obj;
    }

    static async findAllBuses() {
        const docs = await Bus.find({}).sort({ plate_number: 1 }).lean();
        return docs.map(d => ({ ...d, bus_id: d._id.toString() }));
    }

    static async updateBus(bus_id, { plate_number, capacity, model, status }) {
        const doc = await Bus.findByIdAndUpdate(bus_id, { plate_number, capacity, model, status }, { new: true }).lean();
        if (!doc) return null;
        doc.bus_id = doc._id.toString();
        return doc;
    }

    static async deleteBus(bus_id) {
        const doc = await Bus.findByIdAndDelete(bus_id).lean();
        if (!doc) return null;
        return { bus_id: doc._id.toString() };
    }
}

module.exports = BusModel;