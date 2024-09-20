const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    getCategoryById,
    deleteCategory,
    updateCategory,
    addProductToCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.delete('/:id', protect, deleteCategory);
router.put('/:id', protect, updateCategory);
router.post('/:categoryId/add-product', protect, addProductToCategory);

module.exports = router;

