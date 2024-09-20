const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productStockSchema = new mongoose.Schema({
    size: { type: Schema.Types.ObjectId, ref: 'Size', required: true },
    quantity: { type: Number, required: true, default: 0, },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
});

module.exports = mongoose.model('ProductStock', productStockSchema);


