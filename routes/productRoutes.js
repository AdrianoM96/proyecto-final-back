const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,

} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);


module.exports = router;


