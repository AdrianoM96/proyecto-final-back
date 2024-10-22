# proyecto-final-backend
Este proyecto backend es un E-Commerce de indumentaria, realizado con Node y Mongo y utilizando un proyecto front end hecho en NextJs
Aqui el repo (https://github.com/AdrianoM96/proyecto-final) 


## Instalacion
1) Clonar el repositorio.
2) Estando en la raíz del proyecto, corra el comando
```
npm install
```
3) Cambiar el archivo .env.template a .env y establecer sus variables de entorno
4) Ejecutar para inciar el proyecto:
```
npm start
``` 
El proyecto estará disponible en http://localhost:5000

# Aclaracion
### Configuración de Variables de Entorno

Para que MercadoPago funcione correctamente, algunas variables necesitan ser `https`:

- **MP_SUCCESS**, **MP_FAIL**, **MP_PENDING**: URLs de redirección de MercadoPago. Deben ser `https` y configurarse para **backend**.
- **MP_NOTIFICATION**: URL para recibir notificaciones (webhooks) de MercadoPago. Debe ser `https` y configurarse para  **backend**.

Otras variables pueden ser `http`:

- **EMAIL_REDIRECT**: URL para redirección después de ciertas acciones de email. Puede ser `http` y configurarse para **frontend**.
- **EMAIL_VERIFICATION_TOKEN** y **EMAIL_RECOVER_PASSWORD**: URLs para verificar y recuperar contraseñas. Pueden ser `http` y configurarse para **backend**.
- **EMAIL_RECOVERY_PASSWORD_FORM**: URL del formulario de recuperación de contraseña. Necesita ser `https` porque redirige a un sitio de producción. Configurada para **backend**.
- **EMAIL_LOGIN_FORM**: URL de redirección para el login. Puede ser `http` y configurarse para **frontend**.

### Uso de ngrok

Si no tienes un dominio `https`, puedes usar `ngrok` para exponer tu servidor local de forma segura:

1. Ejecuta `./ngrok http 5000` para exponer tu backend.
2. Usa la URL `https` generada por `ngrok` en las variables de entorno de MercadoPago.


## Dependencias

- **Axios**: ^1.7.7
- **Bcryptjs**: ^2.4.3
- **Cookie-parser**: ^1.4.6
- **Cors**: ^2.8.5
- **Dotenv**: ^16.4.5
- **Express**: ^4.19.2
- **Express-rate-limit**: ^7.4.0
- **Helmet**: ^7.1.0
- **Jsonwebtoken**: ^9.0.2
- **Mercadopago**: ^2.0.15
- **Mongodb**: ^6.8.0
- **Mongoose**: ^8.5.1
- **Node-cron**: ^3.0.3
- **Nodemailer**: ^6.9.15
- **Nodemon**: ^3.1.4
- **Pdfkit**: ^0.15.0
- **Pdfkit-table**: ^0.1.99
- **Uuid**: ^10.0.0






