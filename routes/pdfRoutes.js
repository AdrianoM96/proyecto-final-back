const express = require('express');
const router = express.Router();
const { buildPDF } = require('../controllers/pdfController');
const { buildFacturaPDF } = require('../controllers/pdfController');
const { getOrderPDF } = require('../controllers/pdfController');


router.post("/generate", (req, res) => {
    const data = req.body
    const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=reporte.pdf`,
    });

    buildPDF(data,
        (data) => stream.write(data),
        () => stream.end()
    );
});
router.get('/factura/:id', getOrderPDF);

router.post("/factura", (req, res) => {
    const data = req.body

    const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=factura${"facturaId"}.pdf`,
    });

    buildFacturaPDF(data,
        (data) => stream.write(data),
        () => stream.end()
    );
});

module.exports = router;
