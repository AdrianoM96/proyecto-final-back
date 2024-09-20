const express = require('express')
const router = express.Router();
const {
    createPreference,
} = require('../controllers/mercadoPagoController');






router.post('/', createPreference);

module.exports = router;


