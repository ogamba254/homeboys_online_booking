// src/scripts/update_route_price_test.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const RouteModel = require('../models/RouteModel');

(async () => {
    try {
        const routes = await RouteModel.findAllRoutes();
        console.log('Found routes:', routes);
        if (!routes || routes.length === 0) {
            console.log('No routes available to update.');
            process.exit(0);
        }

        const r = routes[0];
        const newPrice = Number(r.base_price || 0) + 100;
        console.log(`Updating route ${r.route_id} (${r.origin} -> ${r.destination}) base_price ${r.base_price} -> ${newPrice}`);
        const updated = await RouteModel.updateRoute(r.route_id, { origin: r.origin, destination: r.destination, base_price: newPrice });
        console.log('Updated route result:', updated);
        process.exit(0);
    } catch (err) {
        console.error('Error in test update script:', err);
        process.exit(1);
    }
})();
