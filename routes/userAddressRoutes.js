const express = require('express');
const {
    createUserAddress,
    getUserAddresses,
    getUserAddressById,
    getUserAddressByUser,
    updateUserAddress,
    deleteUserAddress,
} = require('../controllers/userAddressController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createUserAddress);
router.get('/', getUserAddresses);
router.get('/:id', getUserAddressById);
router.get('/user/:id', getUserAddressByUser);
router.put('/:id', protect, updateUserAddress);
router.delete('/:id', protect, deleteUserAddress);

module.exports = router;
