const express = require("express");

const {
    emailHelper,
    verificationUser,
    verifyTokenEmail,
    recoveryPassword,
    verifyTokenPassword
} = require('../helpers/emailHelper');


const router = express.Router();

router.post('/send-factura', emailHelper);

router.post('/send-verification', verificationUser);
router.get('/verify', verifyTokenEmail);
router.post('/send-recovery', recoveryPassword);
router.post('/reset-password', verifyTokenPassword);



module.exports = router;
