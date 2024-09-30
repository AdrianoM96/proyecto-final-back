const { MercadoPagoConfig, Preference } = require('mercadopago');
const axios = require('axios');

const client = new MercadoPagoConfig({
    accessToken: "APP_USR-3748332052206864-092621-0523122aaf56ef36ba797c5141981741-2010018230"
});

exports.createPreference = async (req, res) => {
    try {
        const body = {
            items: [
                {
                    title: req.body.title,
                    quantity: Number(req.body.quantity),
                    unit_price: Number(req.body.price),
                    currency_id: "ARS"
                },
            ],
            back_urls: {
                success: "https://www.youtube.com/",
                failure: "https://www.youtube.com/",
                pending: "https://www.youtube.com/"
            },
            auto_return: "approved",
            notification_url: "https://4501-2a09-bac5-aa-1b9-00-2c-125.ngrok-free.app/api/mercadopago/webhook"
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });

        res.json({ id: result.id });
    } catch (error) {
        console.error('Error creating MercadoPago preference:', error);
        res.status(500).json({ message: 'Error al crear orden de MercadoPago', error: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const paymentId = req.query.id;
    const payment = req.query;
    console.log({ payment });
    try {
        const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${client.accessToken}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
        }
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};



// // const mercadopago = require('mercadopago');

// // const client = new mercadopago.MercadoPagoConfig({ accessToken: "APP_USR-3748332052206864-092621-0523122aaf56ef36ba797c5141981741-2010018230" });

// // const createPreference = async (req, res) => {
// //     const { title, quantity, price } = req.body;

// //     console.log(req.body)
// //     try {
// //         const body = {
// //             items: [
// //                 {
// //                     title: title,
// //                     quantity: Number(quantity),
// //                     unit_price: Number(price),
// //                     currency_id: "ARS"
// //                 }
// //             ],
// //             back_urls: {
// //                 success: "https://www.youtube.com/",
// //                 failure: "https://www.youtube.com/",
// //                 pending: "https://www.youtube.com/"
// //             },
// //             auto_return: "approved",
// //             notification_url: "https://bcc1-2a09-bac1-680-10-00-2c-127.ngrok-free.app/api/mercadopago/get-payment"
// //         };

// //         const preference = new mercadopago.Preference(client);
// //         const result = await preference.create({ body });
// //         console.log("result")
// //         console.log(result)

// //         res.status(201).json({ id: result.id });
// //     } catch (error) {
// //         console.error('Error creating MercadoPago preference:', error);
// //         res.status(500).json({ message: 'Error al crear orden de MercadoPago', error: error.message });
// //     }
// // };

// // const obtenerPago = async (req, res) => {
// //     const paymentId = req.query.id
// //     console.log("paymentId")
// //     console.log({ paymentId })
// //     try {
// //         const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
// //             method: 'GET',
// //             headres: {
// //                 'Authorization': `Bearer ${client.accessToken}`
// //             }
// //         });
// //         console.log("response")
// //         console.log(response)
// //         console.log("responseOK")
// //         console.log(response.ok)

// //         if (response.ok) {
// //             const data = await response.json();
// //             console.log(data)
// //             console.log("data")
// //             console.log(data.status,
// //                 data.status_detail)
// //             // approved
// //             // accredited
// //             res.status(201).json({
// //                 status: data.status,
// //                 status_detail: data.status_detail
// //             });
// //         }
// //     } catch (error) {
// //         console.log("error", error)
// //         res.sendStatus(500)
// //     }
// // };

// // module.exports = {
// //     createPreference,
// //     obtenerPago
// // };





// const mercadopago = require('mercadopago');

// const client = new mercadopago.MercadoPagoConfig({ accessToken: "APP_USR-3748332052206864-092621-0523122aaf56ef36ba797c5141981741-2010018230" });

// const createPreference = async (req, res) => {
//     const { title, quantity, price } = req.body;

//     console.log('Datos recibidos:', req.body);
//     try {
//         const body = {
//             items: [
//                 {
//                     title: title,
//                     quantity: Number(quantity),
//                     unit_price: Number(price),
//                     currency_id: "ARS"
//                 }
//             ],
//             back_urls: {
//                 success: "https://www.youtube.com/",
//                 failure: "https://www.youtube.com/",
//                 pending: "https://www.youtube.com/"
//             },
//             auto_return: "approved",
//             //notification_url: "https://bcc1-2a09-bac1-680-10-00-2c-127.ngrok-free.app/api/mercadopago/get-payment",
//             external_reference: Date.now().toString()
//         };

//         const preference = new mercadopago.Preference(client);

//         const result = await preference.create({ body });
//         console.log("Preferencia creada:", result);

//         res.redirect(preference.body.sandbox_init_point);
//         res.status(201).json({ id: result.id });
//     } catch (error) {
//         console.error('Error al crear preferencia de MercadoPago:', error);
//         res.status(500).json({ message: 'Error al crear orden de MercadoPago', error: error.message });
//     }
// };

// const obtenerPago = async (req, res) => {
//     const { topic, id } = req.query;
//     console.log("Notificación recibida:", { topic, id });

//     try {
//         switch (topic) {
//             case 'payment':
//                 const payment = await new mercadopago.Payment(client).get({ id: id });
//                 console.log("Datos del pago:", payment);

//                 if (payment.status === 'approved') {
//                     console.log("Pago aprobado:", payment.id);
//                     // Aquí puedes actualizar tu base de datos o realizar otras acciones necesarias
//                 }
//                 break;
//             case 'merchant_order':
//                 const merchantOrder = await new mercadopago.MerchantOrder(client).get({ merchantOrderId: id });
//                 console.log("Orden de comercio:", merchantOrder);
//                 break;
//             default:
//                 console.log("Notificación no manejada:", topic);
//         }

//         res.sendStatus(200);
//     } catch (error) {
//         console.error("Error al procesar la notificación:", error);
//         res.sendStatus(500);
//     }
// };

// module.exports = {
//     createPreference,
//     obtenerPago
// };






// // const mercadopago = require('mercadopago');

// // const client = new mercadopago.MercadoPagoConfig({ accessToken: "APP_USR-3748332052206864-092621-0523122aaf56ef36ba797c5141981741-2010018230" });

// // const createPreference = async (req, res) => {
// //     const { title, quantity, price } = req.body;

// //     console.log(req.body)
// //     try {
// //         const body = {
// //             items: [
// //                 {
// //                     title: title,
// //                     quantity: Number(quantity),
// //                     unit_price: Number(price),
// //                     currency_id: "ARS"
// //                 }
// //             ],
// //             back_urls: {
// //                 success: "https://www.youtube.com/",
// //                 failure: "https://www.youtube.com/",
// //                 pending: "https://www.youtube.com/"
// //             },
// //             auto_return: "approved",
// //             notification_url: "https://bcc1-2a09-bac1-680-10-00-2c-127.ngrok-free.app/api/mercadopago/get-payment",
// //             external_reference: Date.now().toString() // Añade esto
// //         };

// //         const preference = new mercadopago.Preference(client);
// //         const result = await preference.create({ body });
// //         console.log("result", result)

// //         res.status(201).json({ id: result.id });
// //     } catch (error) {
// //         console.error('Error creating MercadoPago preference:', error);
// //         res.status(500).json({ message: 'Error al crear orden de MercadoPago', error: error.message });
// //     }
// // };

// // const obtenerPago = async (req, res) => {
// //     const { topic, id } = req.query;
// //     console.log("Notification received:", { topic, id });

// //     if (topic === 'payment') {
// //         try {
// //             const payment = await mercadopago.Payment.findById(id);
// //             console.log("Payment data:", payment);

// //             // Aquí puedes procesar el pago según su estado
// //             if (payment.status === 'approved') {
// //                 // Pago aprobado, actualiza tu base de datos o realiza otras acciones necesarias
// //                 console.log("Payment approved:", payment.id);
// //             }

// //             res.status(200).json({ status: payment.status });
// //         } catch (error) {
// //             console.error("Error processing payment:", error);
// //             res.status(500).json({ status: payment.status });
// //         }
// //     } else {
// //         res.sendStatus(200);
// //     }
// // };

// // module.exports = {
// //     createPreference,
// //     obtenerPago
// // };