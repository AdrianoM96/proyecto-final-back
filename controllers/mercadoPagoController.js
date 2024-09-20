var mercadopago = require('mercadopago');


var client = new mercadopago.MercadoPagoConfig({ accessToken: 'APP_USR-8546739092055042-090822-11d91518a3b02f70efec2edd54f51ed8-1981342887' });

const createPreference = async (req, res) => {
    const products = req.body

    try {
        const items = products.map(product => ({

            title: product.name,
            quantity: Number(product.quantity),
            unit_price: Number(product.price),
            currency_id: "ARS"
        }));

        var preferenceData = {
            items,
            back_urls: {
                success: "http://localhost:5000/",
                failure: "http://localhost:5000/",
                pending: ""
            },
            auto_return: "approved",
        };

        const preference = new mercadopago.Preference(client);
        const result = await preference.create({ body: preferenceData })
        res.json({
            id: result.id
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Error al procesar el pago: " + error.message
        })
    }
}

module.exports = {
    createPreference
};