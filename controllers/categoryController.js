const Category = require('../models/Category');
const Product = require('../models/Product');


const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const category = new Category({
            name
        });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error creating category', error });
    }
};


const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('products');
        res.status(200).json(categories);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching categories', error });
    }
};

const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id).populate('products');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching category', error });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }


        category.name = name;
        await category.save();

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting category', error });
    }
};


const addProductToCategory = async (req, res) => {
    const { productId } = req.body;
    const { categoryId } = req.params;

    try {
        const category = await Category.findById(categoryId);
        const product = await Product.findById(productId);

        if (!category || !product) {
            return res.status(404).json({ message: 'Category or Product not found' });
        }

        category.products.push(productId);
        await category.save();

        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error adding product to category', error });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    addProductToCategory,
};
