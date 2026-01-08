// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

// Middleware to verify JWT and attach user payload to request
exports.authenticateToken = (req, res, next) => {
    // Rely on the HttpOnly cookie set during login.
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided.' });
    }

    try {
        const user = jwt.verify(token, jwtSecret);
        req.user = user; // Attach user payload (id, role) to the request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware to require 'admin' role
exports.requireAdmin = (req, res, next) => {
    // Use the authentication middleware first
    exports.authenticateToken(req, res, () => {
        // Check role after successful authentication
        if (req.user && req.user.role === 'admin') {
            next(); // User is authenticated and is an admin
        } else {
            res.status(403).json({ message: 'Forbidden: Requires Admin privileges.' });
        }
    });
};