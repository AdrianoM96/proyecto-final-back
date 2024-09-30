const express = require('express')
const router = express.Router();
const {
    createPreference,
    obtenerPago
} = require('../controllers/mercadoPagoController');
const mercadopagoController = require('../controllers/mercadoPagoController');

router.get("/", (req, res) => {
    res.send("MercadoPago API");
});

router.post("/create-preference", mercadopagoController.createPreference);
router.post("/webhook", mercadopagoController.handleWebhook);

module.exports = router;


