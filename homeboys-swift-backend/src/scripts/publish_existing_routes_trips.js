// src/scripts/publish_existing_routes_trips.js
// Create placeholder trips for existing routes that don't have upcoming trips.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const RouteModel = require('../models/RouteModel');
const mongoose = require('../config/db');

(async () => {
    try {
        console.log('Fetching all routes...');
        const routes = await RouteModel.findAllRoutes();
        if (!routes || routes.length === 0) {
            console.log('No routes to process.');
            process.exit(0);
        }

        // For each route, attempt to create trips for next 7 days (or use existing route setting)
        for (const r of routes) {
            // Attempt to call createRoute with publish_days=7 to create missing trips
            try {
                console.log(`Ensuring trips for route ${r.route_id} (${r.origin} -> ${r.destination})`);
                // call lower-level logic: RouteModel.createRoute will create trips, but it will create duplicate route if used directly
                // Instead, we will require TripModel and create trips directly here matching route._id
                const TripModel = require('../models/TripModel');
                // Ensure Bus model is registered
                require('../models/BusModel');
                const Bus = mongoose.model('Bus');
                const bus = await Bus.findOne({ status: 'active' }).lean();
                if (!bus) {
                    console.log('  No active bus found — skipping route trips creation.');
                    continue;
                }
                const today = new Date();
                for (let i = 0; i < 7; i++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() + i);
                    try {
                        await TripModel.createTrip({ route_id: r._id || r.route_id, bus_id: bus._id, departure_time: '09:00', date: d, price: r.base_price });
                        console.log('  Created trip for', d.toISOString().slice(0,10));
                    } catch (err) {
                        // If trip exists or other error, log and continue
                        console.error('  Could not create trip:', err.message);
                    }
                }
            } catch (err) {
                console.error('Error processing route', r.route_id, err.message);
            }
        }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error running publish script:', err);
        process.exit(1);
    }
})();
