const ProductStock = require('../models/ProductStock');
const Product = require('../models/Product');


const addProductStock = async (req, res) => {
    const { productId, size, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }


        const existingStock = await ProductStock.findOne({ product: productId, size });
        if (existingStock) {
            return res.status(400).json({ message: 'Stock for this size already exists' });
        }


        const productStock = new ProductStock({
            size,
            quantity,
            product: productId
        });

        await productStock.save();


        product.stocks.push(productStock._id);
        await product.save();

        res.status(201).json(productStock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllProductStocks = async (req, res) => {
    try {
        const productStocks = await ProductStock.find();
        res.status(200).json(productStocks);
    } catch (error) {
        console.error('Error fetching product stocks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getProductStockById = async (req, res) => {
    const { id } = req.params;

    try {
        const productStock = await ProductStock.findById(id);
        if (!productStock) {
            return res.status(404).json({ message: 'Product stock not found' });
        }

        res.status(200).json(productStock);
    } catch (error) {
        console.error('Error fetching product stock by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



const updateProductStock = async (req, res) => {
    const { id } = req.params;
    const { size, quantity } = req.body;

    try {
        const productStock = await ProductStock.findByIdAndUpdate(
            id,
            { size, quantity },
            { new: true, runValidators: true }
        );

        if (!productStock) {
            return res.status(404).json({ message: 'Product stock not found' });
        }

        res.json(productStock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteProductStock = async (req, res) => {
    const { id } = req.params;

    try {
        const productStock = await ProductStock.findByIdAndDelete(id);
        if (!productStock) {
            return res.status(404).json({ message: 'Product stock not found' });
        }


        await Product.findByIdAndUpdate(productStock.product, {
            $pull: { stocks: productStock._id }
        });

        res.json({ message: 'Product stock deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addProductStock,
    getAllProductStocks,
    getProductStockById,
    updateProductStock,
    deleteProductStock
};
