const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emailVerified: {
        type: Date,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    image: {
        type: String,
    },
    address: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAddress',
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    }],
});


const User = mongoose.model('User', userSchema);

module.exports = User;
