const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    subTotal: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    itemsInOrder: {
        type: Number,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        updatedAt: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
    }],
    orderAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderAddress',
    },
    transactionId: {
        type: String,
        default: ""
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
