// src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

// --- CRITICAL FIX: LOAD ENV VARIABLES FIRST ---
// Assuming .env is in the project root (one level up from src/index.js)
dotenv.config({ path: path.join(__dirname, '..', '.env') }); 

// Initialize DB connection (NOW it can access process.env.PGUSER, etc.)
require('./config/db'); 

// Import all Routes
const authRoutes = require('./routes/AuthRoutes');
const routeRoutes = require('./routes/RouteRoutes');
const busRoutes = require('./routes/BusRoutes');
const tripRoutes = require('./routes/TripRoutes');
const bookingRoutes = require('./routes/BookingRoutes');
const reportRoutes = require('./routes/ReportRoutes');

const app = express();
// Using process.env.PORT || 3000 is perfect for deployment
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// 1. Static File Serving
// Serve the HTML pages as the site root and public assets under /public
const pagesPath = path.join(__dirname, '..', '..', 'frontend', 'pages');
const publicPath = path.join(__dirname, '..', '..', 'frontend', 'public');
app.use(express.static(pagesPath));
app.use('/public', express.static(publicPath));

// 2. API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/buses', busRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reports', reportRoutes);

// --- CATCH-ALL ROUTE ---
app.get('/', (req, res) => {
    res.sendFile(path.join(pagesPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open in browser: http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});