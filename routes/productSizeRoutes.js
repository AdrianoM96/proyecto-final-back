const express = require('express');
const router = express.Router();
const {
    createSize,
    getSizes,
    getSizeById,
    updateSize,
    deleteSize
} = require('../controllers/ProductSizeController');


router.post('/', createSize);


router.get('/', getSizes);

router.get('/:id', getSizeById);


router.put('/:id', updateSize);


router.delete('/:id', deleteSize);

module.exports = router;
