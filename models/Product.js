const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductImage' }],
    stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductStock' }],
    gender: { type: String },
    isPaused: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);
