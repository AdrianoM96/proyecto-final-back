const Order = require('../models/Order');
const OrderAddress = require('../models/OrderAddress');
const OrderItem = require('../models/OrderItem');
const Size = require('../models/ProductSize');
const Country = require('../models/Country');
const Product = require('../models/Product');
const ProductStock = require('../models/ProductStock');
const User = require('../models/User');


const { buildFacturaPDF } = require('./pdfController');
const { sendEmail } = require('../helpers/emailHelper');

const mongoose = require('mongoose');

const createOrder = async (req, res) => {
    const { subTotal, tax, total, itemsInOrder, isPaid, paidAt, user, orderItems, orderAddress, transactionId } = req.body;

    const userBd = await User.findById(user);

    if (!userBd) {
        return res.status(404).json({ message: 'User not found' });
    }

    try {
        const order = new Order({
            subTotal,
            tax,
            total,
            itemsInOrder,
            isPaid,
            paidAt,
            user: user,
            orderItems,
            orderAddress,
            transactionId,
        });


        const savedOrder = await order.save();


        const userDoc = await User.findById(user);
        if (!userDoc) {
            return res.status(404).json({ message: 'User not found' });
        }

        userDoc.orders.push(savedOrder._id);
        await userDoc.save();


        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Error creating order', error });
    }

};

const orderComplete = async (req, res) => {
    const { userId, itemsInOrder, subTotal, tax, total, productIds, products, countryId, restAddress } = req.body;

    let savedOrder = null;
    let insertedOrderItems = null;
    let stockChanges = [];


    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        savedOrder = await createAndSaveOrder(userId, itemsInOrder, subTotal, tax, total);


        insertedOrderItems = await createOrderItems(productIds, products, savedOrder._id);


        await updateOrderWithItems(savedOrder, insertedOrderItems);


        await addOrderToUser(user, savedOrder);





        const savedOrderAddress = await verifyAndAddOrderAddress(countryId, restAddress, savedOrder._id);


        savedOrder.orderAddress = savedOrderAddress._id;
        await savedOrder.save();

        res.status(201).json(savedOrder);

    } catch (error) {
        console.error('Error creando la ordenn:', error.message);

        await handleOrderError(savedOrder, insertedOrderItems);
        res.status(500).json({ error: 'Error creando la orden', details: error.message });
    }
};



const createAndSaveOrder = async (userId, itemsInOrder, subTotal, tax, total) => {
    const order = new Order({
        user: userId,
        itemsInOrder,
        subTotal,
        tax,
        total
    });
    return await order.save();
};


const createOrderItems = async (productIds, products, orderId) => {
    const orderItems = productIds.map((p) => ({
        quantity: p.quantity,
        size: p.size,
        product: p.productId,
        price: products.find((product) => product._id.toString() === p.productId)?.price ?? 0,
        order: orderId
    }));
    return await OrderItem.insertMany(orderItems);
};


const updateOrderWithItems = async (order, orderItems) => {
    order.orderItems = orderItems.map(item => item._id);
    return await order.save();
};

const addOrderToUser = async (user, order) => {
    user.orders.push(order._id);
    return await user.save();
};

const updateProductStocks = async (productIds, shouldUpdate = true) => {
    const sizeNames = [...new Set(productIds.map(p => p.size))];
    const sizes = await Size.find({ name: { $in: sizeNames } });
    const sizeMap = sizes.reduce((acc, size) => {
        acc[size.name] = size._id;
        return acc;
    }, {});

    const missingSizes = sizeNames.filter(name => !sizeMap[name]);
    if (missingSizes.length > 0) {
        return {
            ok: false,
            errors: `No se encontraron los siguientes tamaños: ${missingSizes.join(', ')}`
        };
    }

    const productIdsSet = [...new Set(productIds.map(p => p.productId))];
    const products = await Product.find({ _id: { $in: productIdsSet } });
    const productsMap = products.reduce((acc, product) => {
        acc[product._id.toString()] = product.name;
        return acc;
    }, {});

    const stockChecks = await Promise.all(productIds.map(async (p) => {
        const sizeId = sizeMap[p.size];
        const productStock = await ProductStock.findOne({ product: p.productId, size: sizeId });

        if (!productStock) {
            const productName = productsMap[p.productId.toString()];
            return { productName, size: p.size, message: 'No stock found' };
        }

        if (productStock.quantity < p.quantity) {
            const productName = productsMap[p.productId.toString()];
            return { productName, size: p.size, message: 'Insufficient stock' };
        }


        if (shouldUpdate) {
            productStock.quantity -= p.quantity;
            await productStock.save();
        }

        return null;
    }));


    const errors = stockChecks.filter(item => item !== null);

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    return { ok: true };
};



const verifyAndAddOrderAddress = async (countryId, restAddress, orderId) => {


    const country = await Country.findOne({ _id: countryId });
    if (!country) {
        throw new Error('Country not found');
    }

    const orderAddress = new OrderAddress({
        firstName: restAddress.firstName,
        lastName: restAddress.lastName,
        address: restAddress.address,
        address2: restAddress.address2,
        postalCode: restAddress.postalCode,
        city: restAddress.city,
        phone: restAddress.phone,
        country: country._id,
        order: orderId
    });

    return await orderAddress.save();
};


const handleOrderError = async (order, orderItems) => {
    if (order) {
        await Order.findByIdAndDelete(order._id);
    }
    if (orderItems && orderItems.length > 0) {
        const orderItemIds = orderItems.map(item => item._id);
        await OrderItem.deleteMany({ _id: { $in: orderItemIds } });
    }

};


const updateOrderStock = async (req, res) => {
    const productIds = req.body.productIds
    const update = req.body.update



    try {

        const response = await updateProductStocks(productIds, update)


        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ message: 'Error updating stocks', error });
    }
};




const getAllOrders = async (req, res) => {
    try {

        const orders = await Order.find()
            .populate('user')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product'
                }
            })
            .populate('orderAddress');

        res.status(200).json({ orders });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching orders', error });
    }
};


const getOrdersPaginatedByUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const userId = req.query.id;
        const query = userId ? { user: userId } : {};


        const orders = await Order.find(query)
            .skip(startIndex)
            .limit(limit)
            .populate('user')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product'
                }
            })
            .populate('orderAddress');



        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);
        res.status(200).json({
            currentPage: page,
            totalPages,
            orders
        });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching orders', error });
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await updateOrderPrices(id)
        if (!order) {
            return res.status(404).json({ message: 'Order not found or not updated' });
        }


        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching order', error });
    }
};

const getOrdersByUserId = async (req, res) => {
    const { id } = req.params;
    try {

        const orders = await Order.find({ user: id })
            .populate('user')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: {
                        path: 'images',
                        model: 'ProductImage'
                    }
                }
            })
            .populate({
                path: 'orderAddress',
                populate: {
                    path: 'country'
                }
            });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching orders', error });
    }
};


const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { subTotal, tax, total, itemsInOrder, isPaid, paidAt, user, orderItems, orderAddress, transactionId } = req.body;

    try {
        const order = await Order.findById(id)
            .populate('user')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    select: '_id price name'
                }
            })
            .populate('orderAddress');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }


        Object.assign(order, {
            subTotal: subTotal || order.subTotal,
            tax: tax || order.tax,
            total: total || order.total,
            itemsInOrder: itemsInOrder || order.itemsInOrder,
            isPaid: isPaid || order.isPaid,
            paidAt: paidAt || order.paidAt,
            user: user || order.user,
            orderItems: orderItems || order.orderItems,
            orderAddress: orderAddress || order.orderAddress,
            transactionId: transactionId || order.transactionId
        });

        await order.save();


        const pdfPath = await buildFacturaPDF(req.body, order);

        const emailSend = await sendEmail(order.user.name, order.user.email, order._id)

        res.status(200).json({ message: 'Order updated and invoice generated', order });
    } catch (error) {
        res.status(400).json({ message: 'Error updating order', error: error.message });
    }
};


const updateOrderPrices = async (id) => {
    try {
        const order = await Order.findById(id)
            .populate('user')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    select: '_id price images',
                    populate: {
                        path: 'images',
                        model: 'ProductImage'
                    }
                }
            })
            .populate({
                path: 'orderAddress',
                populate: {
                    path: 'country'
                }
            });



        if (!order) {
            throw new Error('Order not found');
        }

        let subTotal = 0;
        let pricesUpdated = false;

        for (const item of order.orderItems) {
            const currentProduct = item.product._id;


            if (!currentProduct) {
                throw new Error(`Product not found: ${item.product._id}`);
            }

            if (item.product.price !== item.price) {

                item.price = item.product.price;
                pricesUpdated = true;
            }

            subTotal += item.price * item.quantity;
        }

        const tax = subTotal * 0.21;
        const total = subTotal + tax;

        order.subTotal = subTotal;
        order.tax = tax;
        order.total = total;

        if (pricesUpdated) {
            await order.save();
            return order
        } else {
            return order
        }
    } catch (error) {
        throw new Error(`Error updating order prices: ${error.message}`);
    }
};


const deleteOrder = async (req, res) => {
    const { id } = req.params;
    let userId = null;

    try {

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        userId = order.user;

        await OrderItem.deleteMany({ order: id });



        if (userId) {
            await User.updateOne(
                { _id: userId },
                { $pull: { orders: id } }
            );
        }


        await Order.findByIdAndDelete(id);


        res.status(200).json({ message: 'Order removed' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting order', error });
    }
};



module.exports = {
    createOrder,
    orderComplete,
    updateOrderStock,
    getAllOrders,
    getOrdersPaginatedByUser,
    getOrderById,
    getOrdersByUserId,
    updateOrder,
    deleteOrder,
    updateOrderPrices
};














