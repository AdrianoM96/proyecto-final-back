const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');


const createSubCategory = async (req, res) => {
    const { name, category, products } = req.body;

    try {
        const subCategory = new SubCategory({
            name,
            category,
            products,
        });


        const savedSubCategory = await subCategory.save();


        if (products && products.length > 0) {
            await Product.updateMany(
                { _id: { $in: products } },
                { $set: { subCategory: savedSubCategory._id } }
            );
        }

        res.status(201).json(savedSubCategory);
    } catch (error) {
        res.status(400).json({ message: 'Error creating subcategory', error });
    }
};

const getSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('category').populate('products');
        res.status(200).json(subCategories);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching subcategories', error });
    }
};


const getSubCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const subCategory = await SubCategory.findById(id).populate('category').populate('products');
        if (!subCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }
        res.status(200).json(subCategory);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching subcategory', error });
    }
};


const updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const { name, category, products } = req.body;

    try {
        const subCategory = await SubCategory.findById(id);
        if (!subCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        subCategory.name = name || subCategory.name;
        subCategory.category = category || subCategory.category;
        subCategory.products = products || subCategory.products;


        const updatedSubCategory = await subCategory.save();


        if (products && products.length > 0) {
            await Product.updateMany(
                { _id: { $in: products } },
                { $set: { subCategory: updatedSubCategory._id } }
            );
        }

        res.status(200).json(updatedSubCategory);
    } catch (error) {
        res.status(400).json({ message: 'Error updating subcategory', error });
    }
};


const deleteSubCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const subCategory = await SubCategory.findByIdAndDelete(id);
        if (!subCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }


        await Product.updateMany(
            { subCategory: subCategory._id },
            { $unset: { subCategory: "" } }
        );

        res.status(200).json({ message: 'SubCategory deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting subcategory', error });
    }
};

module.exports = {
    createSubCategory,
    getSubCategories,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory,
};
