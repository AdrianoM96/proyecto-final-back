const mongoose = require('mongoose');

const orderAddressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    address2: {
        type: String,
    },
    postalCode: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        ref: 'Country',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
    },
});

const OrderAddress = mongoose.model('OrderAddress', orderAddressSchema);

module.exports = OrderAddress;
