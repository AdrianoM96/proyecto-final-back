const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
});

const ProductImage = mongoose.model('ProductImage', productImageSchema);

module.exports = ProductImage;
