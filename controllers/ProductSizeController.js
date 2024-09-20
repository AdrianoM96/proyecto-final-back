const Size = require('../models/ProductSize');


const createSize = async (req, res) => {
    const { name } = req.body;

    try {
        const size = new Size({ name });
        const savedSize = await size.save();
        res.status(201).json(savedSize);
    } catch (error) {
        res.status(400).json({ message: 'Error creating size', error });
    }
};


const getSizes = async (req, res) => {
    try {
        const sizes = await Size.find();
        if (!sizes) {
            return res.status(404).json({ message: 'Sizes not found' });
        }
        res.status(200).json(sizes);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching sizes', error });
    }
};


const getSizeById = async (req, res) => {
    const { id } = req.params;

    try {
        const size = await Size.findById(id);
        if (!size) {
            return res.status(404).json({ message: 'Size not found' });
        }
        res.status(200).json(size);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching size', error });
    }
};


const updateSize = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const size = await Size.findById(id);
        if (!size) {
            return res.status(404).json({ message: 'Size not found' });
        }

        size.name = name || size.name;
        const updatedSize = await size.save();
        res.status(200).json(updatedSize);
    } catch (error) {
        res.status(400).json({ message: 'Error updating size', error });
    }
};


const deleteSize = async (req, res) => {
    const { id } = req.params;

    try {
        const size = await Size.findByIdAndDelete(id);
        if (!size) {
            return res.status(404).json({ message: 'Size not found' });
        }

        res.status(200).json({ message: 'Size deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting size', error });
    }
};

module.exports = {
    createSize,
    getSizes,
    getSizeById,
    updateSize,
    deleteSize,
};
