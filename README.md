# PROYECTO FINAL UTN - backend
Este proyecto final de la Tecnicatura Universitaria en Programación de la UTN Regional Mendoza consiste en una aplicación para la gestión de ventas de una tienda
    de indumentaria. La aplicación utiliza una base de datos MongoDB y una API REST para manejar la lógica de negocio. El frontend está desarrollado en Next.js, 
    con un diseño responsive que garantiza una experiencia de usuario óptima en distintos dispositivos. Los clientes pueden explorar el catálogo de productos,
    realizar compras y gestionar su cuenta, incluyendo funcionalidades como recuperación y cambio de contraseña, verificación de email, y la recepción de la 
    factura de compra directamente en su correo electrónico, además de la opción de descargarla desde el apartado de sus órdenes. Los administradores, por su parte,
    tienen acceso a la gestión de productos,
    control de órdenes, facturación y la generación de reportes detallados.


## Repositorio frontend
[FRONTEND](https://github.com/AdrianoM96/proyecto-final)

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

- **EMAIL_REDIRECT**: URL para redirección después de ciertas acciones de email. Configurarse para **frontend**.
- **EMAIL_VERIFICATION_TOKEN** y **EMAIL_RECOVER_PASSWORD**: URLs para verificar y recuperar contraseñas. Configurarse para **backend**.
- **EMAIL_RECOVERY_PASSWORD_FORM**: URL del formulario de recuperación de contraseña. Configurarse para **backend**.
- **EMAIL_LOGIN_FORM**: URL de redirección para el login. Configurarse para **frontend**.

### Uso de ngrok

Si no tienes un dominio `https`, puedes usar `ngrok` para exponer tu servidor local de forma segura:

1. Ejecuta `./ngrok http 5000` para exponer tu backend.
2. Usa la URL `https` generada por `ngrok` en las variables que corresponda

Este es un ejemplo de lo que debes lograr:

``` 
MONGO_URI=mongodb://localhost:27017/tu_base_de_datos
PORT=5000
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=30d

# MercadoPago
MP_SUCCESS=https://tu-dominio-WEB.com  
MP_FAIL=https://tu-dominio-WEB.com 
MP_PENDING=https://tu-dominio-WEB.com 
MP_NOTIFICATION=https://tu-dominio-SERVIDOR.com 

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_REDIRECT=http://localhost:3000
EMAIL_VERIFICATION_TOKEN=http://localhost:5000
EMAIL_RECOVERY_PASSWORD_FORM=http://localhost:3000
EMAIL_LOGIN_FORM=http://localhost:3000
``` 

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






