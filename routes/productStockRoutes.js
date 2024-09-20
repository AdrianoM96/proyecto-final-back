const express = require('express');
const router = express.Router();
const {
    addProductStock,
    getAllProductStocks,
    getProductStockById,
    updateProductStock,
    deleteProductStock
} = require('../controllers/productStockController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addProductStock);
router.get('/', protect, getAllProductStocks);
router.get('/:id', protect, getProductStockById);
router.put('/:id', protect, updateProductStock);
router.delete('/:id', protect, deleteProductStock);

module.exports = router;
