const express = require('express');
const {
    createOrderItem,
    getOrderItems,
    getOrderItemById,
    updateOrderItem,
    deleteOrderItem,
} = require('../controllers/orderItemController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/', protect, createOrderItem);
router.get('/', getOrderItems);
router.get('/:id', getOrderItemById);
router.put('/:id', protect, updateOrderItem);
router.delete('/:id', protect, deleteOrderItem);

module.exports = router;
