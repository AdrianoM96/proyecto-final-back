const express = require('express');
const {
    createOrderAddress,
    getOrderAddresses,
    getOrderAddressById,
    updateOrderAddress,
    deleteOrderAddress,
} = require('../controllers/orderAddressController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createOrderAddress);
router.get('/', getOrderAddresses);
router.get('/:id', getOrderAddressById);
router.put('/:id', protect, updateOrderAddress);
router.delete('/:id', protect, deleteOrderAddress);

module.exports = router;
