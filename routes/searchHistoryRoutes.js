const express = require('express');
const router = express.Router();
const {
    saveSearchHistory,
    getSearchHistory,


} = require('../controllers/searchHistoryController');
const { protect } = require('../middleware/authMiddleware');


router.post('/save-search-history', saveSearchHistory);
router.get('/get-search-history', getSearchHistory);



module.exports = router;

