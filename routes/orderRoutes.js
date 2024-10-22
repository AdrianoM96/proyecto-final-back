const express = require('express');
const verifyRole = require("../middleware/verifyRole.Middleware")
const {
    createOrder,
    getOrdersPaginatedByUser,
    orderComplete,
    updateOrderStock,
    getAllOrders,
    getOrderById,
    getOrdersByUserId,
    updateOrder,
    deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createOrder);
router.post('/orderComplete', protect, orderComplete);
router.get('/', getOrdersPaginatedByUser);
router.get('/all', getAllOrders);
router.get('/:id', getOrderById);
router.get('/user/:id', getOrdersByUserId);
router.put('/stock', updateOrderStock);
router.put('/:id', protect, updateOrder);
router.delete('/:id', protect, verifyRole(['admin']), deleteOrder);

module.exports = router;
