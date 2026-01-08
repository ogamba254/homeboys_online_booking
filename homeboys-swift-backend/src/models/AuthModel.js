// src/models/AuthModel.js (Mongoose)
const mongoose = require('../config/db');

const { Schema } = mongoose;

const UserSchema = new Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'passenger' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

class AuthModel {
    static async findUserByEmail(email) {
        try {
            const user = await User.findOne({ email }).lean();
            if (!user) return null;
            user.user_id = user._id.toString();
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new Error('Database error during user lookup.');
        }
    }

    static async createUser({ name, email, phone, passwordHash, role = 'passenger' }) {
        try {
            const created = await User.create({
                full_name: name,
                email,
                phone,
                password_hash: passwordHash,
                role
            });
            const obj = created.toObject();
            obj.user_id = obj._id.toString();
            return obj;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Database error during user creation.');
        }
    }
}

module.exports = AuthModel;