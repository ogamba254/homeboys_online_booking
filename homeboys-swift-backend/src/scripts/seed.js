// src/scripts/seed.js
const mongoose = require('../config/db');
const bcrypt = require('bcrypt');

// Ensure models are registered
require('../models/AuthModel');
require('../models/BusModel');
require('../models/RouteModel');
require('../models/TripModel');
require('../models/BookingModel');

const User = mongoose.model('User');
const Bus = mongoose.model('Bus');
const Route = mongoose.model('Route');
const Trip = mongoose.model('Trip');

async function waitForConnection() {
  if (mongoose.connection.readyState === 1) return;
  await new Promise((resolve, reject) => {
    mongoose.connection.once('open', resolve);
    setTimeout(() => reject(new Error('Timeout waiting for MongoDB connection')), 10000);
  });
}

async function seed() {
  try {
    await waitForConnection();

    // Admin user - ensure the admin credentials you requested exist
    const adminEmail = 'nyangurudedalius@gmail.com';
    const adminPassword = 'ogamba@254';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hash = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({ full_name: 'Admin', email: adminEmail, phone: '0000000000', password_hash: hash, role: 'admin' });
      console.log('Created admin user:', adminEmail);
    } else {
      console.log('Admin already exists:', adminEmail);
    }

    // Buses
    const busesData = [
      { plate_number: 'HB-001', capacity: 40, model: 'Toyota Coaster' },
      { plate_number: 'HB-002', capacity: 30, model: 'Mercedes Sprinter' }
    ];

    const buses = [];
    for (const b of busesData) {
      let doc = await Bus.findOne({ plate_number: b.plate_number });
      if (!doc) {
        doc = await Bus.create(b);
        console.log('Created bus', b.plate_number);
      }
      buses.push(doc);
    }

    // Routes
    const routesData = [
      { origin: 'CityA', destination: 'CityB', base_price: 100 },
      { origin: 'CityB', destination: 'CityC', base_price: 120 }
    ];

    const routes = [];
    for (const r of routesData) {
      let doc = await Route.findOne({ origin: r.origin, destination: r.destination });
      if (!doc) {
        doc = await Route.create(r);
        console.log('Created route', r.origin, '->', r.destination);
      }
      routes.push(doc);
    }

    // Trips: create schedules for the next 15 days
    const daysAhead = 15;
    const departureTimes = ['08:00', '10:00', '14:00']; // sample times per day

    for (let d = 0; d < daysAhead; d++) {
      const tripDate = new Date();
      tripDate.setDate(tripDate.getDate() + d);
      tripDate.setHours(0,0,0,0);

      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        // rotate buses if fewer buses than routes
        const bus = buses[i % buses.length];

        for (const time of departureTimes) {
          const exists = await Trip.findOne({
            route_id: route._id,
            bus_id: bus._id,
            departure_time: time,
            date: { $gte: new Date(tripDate).setHours(0,0,0,0), $lt: new Date(tripDate).setHours(23,59,59,999) }
          });

          if (!exists) {
            await Trip.create({
              route_id: route._id,
              bus_id: bus._id,
              departure_time: time,
              date: new Date(tripDate),
              price: route.base_price + 50, // sample price calculation
              available_seats: bus.capacity
            });
            console.log('Created trip', route.origin, '->', route.destination, 'at', time, tripDate.toDateString());
          }
        }
      }
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
