const express = require('express');
const verifyRole = require("../middleware/verifyRole.Middleware")
const {
    createCountry,
    getCountries,
    getCountryById,
    updateCountry,
    deleteCountry,
} = require('../controllers/countryController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, verifyRole(['admin']), createCountry);
router.get('/', getCountries);
router.get('/:id', getCountryById);
router.put('/:id', protect, updateCountry);
router.delete('/:id', protect, deleteCountry);

module.exports = router;
