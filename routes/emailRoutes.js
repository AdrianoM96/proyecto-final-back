const express = require("express");

const {
    emailHelper,
    verificationUser,
    verifyTokenEmail
} = require('../helpers/emailHelper');


const router = express.Router();

router.post('/send-factura', emailHelper);

router.post('/send-verification', verificationUser);
router.get('/verify', verifyTokenEmail);



module.exports = router;
