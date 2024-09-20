const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
