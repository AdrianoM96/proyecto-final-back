const express = require('express');
const {
    createProductImage,
    getProductImages,
    getProductImageById,
    updateProductImage,
    deleteProductImage,
} = require('../controllers/productImageController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createProductImage);
router.get('/', getProductImages);
router.get('/:id', getProductImageById);
router.put('/:id', protect, updateProductImage);
router.delete('/:id', protect, deleteProductImage);

module.exports = router;
