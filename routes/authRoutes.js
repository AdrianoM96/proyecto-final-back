const express = require('express');

const {
    registerUser,
    authenticateUser,
    getUser,
    verifyToken,
    logout
} = require('../controllers/authController');

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', authenticateUser);
router.get("/verify", verifyToken);
router.post("/logout", verifyToken, logout);


module.exports = router;

