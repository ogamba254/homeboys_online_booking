// src/config/db.js - MongoDB (Mongoose) connection
const mongoose = require('mongoose');
const path = require('path');

// Ensure env variables are loaded (index.js loads dotenv before requiring this file,
// but keep a fallback in case this file is used standalone)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoUri = process.env.MONGO_URI || process.env.DB_URI;
if (!mongoUri) {
    console.error('MONGO_URI not set in environment. Please set MONGO_URI in .env');
}

const connect = async () => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Successfully connected to MongoDB.');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

connect();

module.exports = mongoose;