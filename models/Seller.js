const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    condition: { type: String, required: true },
    dateNow: { type: String, required: true },
    cuit: { type: String, required: true },
    iibb: { type: String, required: true },
    activityStart: { type: String, required: true },
    singleton: { type: Boolean, default: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Seller', sellerSchema);
