// src/controllers/AuthController.js
const bcrypt = require('bcrypt');
const AuthModel = require('../models/AuthModel');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
const saltRounds = 10;

exports.registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const existingUser = await AuthModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await AuthModel.createUser({ 
            name, 
            email, 
            phone, 
            passwordHash,
            role: 'passenger'
        });

        res.status(201).json({ 
            message: 'Registration successful. Please log in.',
            user: { id: newUser.user_id, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password.' });
    }

    try {
        const user = await AuthModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role }, 
            jwtSecret, 
            { expiresIn: '1d' }
        );

        // Set HttpOnly Cookie
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 24 * 60 * 60 * 1000 
        });

        // Determine redirection URL based on role
        let redirectUrl = user.role === 'admin' ? '/admin/dashboard.html' : '/index.html'; 

        res.status(200).json({
            message: 'Login successful.',
            token,
            role: user.role,
            user_id: user.user_id,
            email: user.email,
            redirectUrl 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// Admin: list all users
exports.getAllUsers = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const User = mongoose.model('User');
        const docs = await User.find({}).lean();
        const users = docs.map(d => ({ user_id: d._id.toString(), full_name: d.full_name, email: d.email, phone: d.phone, role: d.role, createdAt: d.createdAt }));
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users.' });
    }
};