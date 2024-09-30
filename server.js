const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const createAdminUser = require('./utils/initAdmin');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const countryRoutes = require('./routes/countryRoutes');
const orderAddressRoutes = require('./routes/orderAddressRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productImageRoutes = require('./routes/productImageRoutes');
const productRoutes = require('./routes/productRoutes');
const userAddressRoutes = require('./routes/userAddressRoutes');
const userRoutes = require('./routes/userRoutes');
const productStockRoutes = require('./routes/productStockRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const productSizeRoutes = require('./routes/productSizeRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.disable('x-powered-by');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP, please try again later'
});

app.use(limiter);


app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
}).then(async () => {
    console.log('MongoDB connected');
    await createAdminUser();
}).catch((err) => {
    console.error(err);
});


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/product-images', productImageRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-addresses', orderAddressRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/user-addresses', userAddressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/product-stocks', productStockRoutes);
app.use('/api/sub-categories', subCategoryRoutes);
app.use('/api/sizes', productSizeRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
