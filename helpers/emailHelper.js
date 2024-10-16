

const nodemailer = require("nodemailer");
const path = require('path');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

const sendEmail = async (name, to, facturaId) => {

    const subject = ` ¡Gracias por tu compra! Aquí tienes tu factura ${facturaId}`

    const text = `
    Hola ${name},

    Esperamos que estés disfrutando de tu reciente compra.
    Te adjuntamos la factura de tu pedido.
    Si tienes alguna pregunta o necesitas más información,
    no dudes en ponerte en contacto con nosotros.

    ¡Gracias por confiar en nosotros y esperamos verte pronto de nuevo!
`;


    if (!to || !subject || !text) {
        throw new Error('Faltan campos requeridos.');
    }


    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        pool: true,
    });


    const pdfPath = path.join(__dirname, '..', 'facturas', `factura-${facturaId}.pdf`);


    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
        attachments: [
            {
                filename: 'factura.pdf',
                path: pdfPath,
            }
        ]
    };


    try {
        let info = await transporter.sendMail(mailOptions);

        return info;
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw error;
    }
};


const emailHelper = async (req, res) => {
    const { name, email, order } = req.body;
    try {
        const info = await sendEmail(name, email, order);
        return res.status(200).json({ message: 'Correo enviado exitosamente.', info });
    } catch (error) {
        return res.status(500).json({ error: 'Error al enviar el correo.' });
    }
};





const sendVerificationEmail = async (to, verificationToken) => {
    const subject = "Verifica tu dirección de correo electrónico";
    const urlVerifytoken = process.env.EMAIL_VERIFICATION_TOKEN || "http://localhost:5000"

    const text = `
   <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        </style>
      </head>
      <body style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <tr>
            <td style="background-color: #f4f4f4; padding: 40px; text-align: center;">
              <h1 style="color: #2c3e50; margin-bottom: 20px;">Verifica tu dirección de correo electrónico</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: #ffffff;">
              <p>Hola,</p>
              <p>Gracias por registrarte en nuestro servicio. Para completar tu registro, 
              por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
              <p style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                <a href="${urlVerifytoken}/api/email/verify?token=${verificationToken}" 
                   style="background-color: #3498db; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Verificar mi correo electrónico
                </a>
              </p>
              <p>Si no has solicitado esta verificación, puedes ignorar este correo.</p>
              <p>¡Gracias por unirte a nosotros!</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #888;">
              <p>&copy; 2023 Tu Empresa. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

    if (!to || !subject || !text) {
        throw new Error('Faltan campos requeridos.');
    }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        pool: true,
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: "adrym09@gmail.com",
        subject: subject,
        html: text
    };

    try {
        let info = await transporter.sendMail(mailOptions);

        return info;
    } catch (error) {

        throw error;
    }
};

const verificationUser = async (req, res) => {
    const { email } = req.body;


    try {

        const verificationToken = uuidv4();


        const user = await User.findOneAndUpdate(
            { email: email },
            {
                verificationToken: verificationToken,
                tokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
        );

        if (user.emailVerified) {
            return res.status(400).json({ error: 'El correo electrónico ya ha sido verificado.' });
        }

        await sendVerificationEmail(email, verificationToken);

        res.status(200).json({ ok: true, message: 'Correo de verificación enviado exitosamente.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud de verificación.' });
    }
};



const verifyTokenEmail = async (req, res) => {
    const { token } = req.query;
    const redirect = process.env.EMAIL_REDIRECT || "http://localhost:3000"


    try {
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ error: 'Token inválido.' });
        }

        if (user.tokenExpiration < new Date()) {
            return res.status(400).json({ error: 'Token expirado.' });
        }

        user.emailVerified = new Date();
        user.verificationToken = null;
        user.tokenExpiration = null;

        await user.save();

        res.redirect(redirect + "/profile");

    } catch (error) {
        console.error('Error:', error);
        res.redirect(redirect + "/profile");

    }

};

module.exports = {
    sendEmail,
    emailHelper,
    sendVerificationEmail,
    verificationUser,
    verifyTokenEmail
};
