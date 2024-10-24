const { MercadoPagoConfig, Preference } = require('mercadopago');

require('dotenv').config();


const client = new MercadoPagoConfig({
    accessToken: "APP_USR-3748332052206864-092621-0523122aaf56ef36ba797c5141981741-2010018230"
});


exports.createPreference = async (req, res) => {

    const success = process.env.MP_SUCCESS || ""
    const fail = process.env.MP_FAIL || ""
    const pending = process.env.MP_PENDING || ""
    const notification = process.env.MP_NOTIFICATION || ""

    try {
        const items = req.body.items.map(item => ({
            title: item.title,
            quantity: Number(item.quantity),
            unit_price: Number((item.price * 1.21).toFixed(2)),
            currency_id: "ARS",
        }));

        const body = {
            items: items,

            back_urls: {
                success: `${success}/orders/${req.body.orderId}`,
                failure: `${fail}/orders/${req.body.orderId}`,
                pending: `${pending}/orders/${req.body.orderId}`
            },
            auto_return: "approved",
            notification_url: `${notification}/api/mercadopago/webhook`
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });

        res.json({
            id: result.id
        });
    } catch (error) {
        console.error('Error creating MercadoPago preference:', error);
        res.status(500).json({ message: 'Error al crear orden de MercadoPago', error: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const paymentId = req.query.id


    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${client.accessToken}`

            }
        })

        if (response.ok) {
            const data = await response.json();

        }
        res.sendStatus(200);
    } catch (error) {

        res.sendStatus(500)
    }
};




