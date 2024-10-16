const express = require('express');
const router = express.Router();
const {
    addSeller,
    getSeller,
    updateSeller


} = require('../controllers/sellerController');
const { protect } = require('../middleware/authMiddleware');


router.post('/addSeller', protect, addSeller);
router.get('/getData', getSeller);
router.put('/:id', updateSeller);


module.exports = router;

