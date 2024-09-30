const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL'],
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
