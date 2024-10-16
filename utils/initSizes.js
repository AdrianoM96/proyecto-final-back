const Size = require('../models/ProductSize');

const createSizes = async () => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    try {
        for (const sizeName of sizes) {
            let size = await Size.findOne({ name: sizeName });

            if (!size) {
                size = new Size({ name: sizeName });
                await size.save();

            }
        }
    } catch (error) {
        console.error('Error creating sizes:', error);
    }
};

module.exports = { createSizes };
