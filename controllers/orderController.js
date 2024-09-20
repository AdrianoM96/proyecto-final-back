const Order = require('../models/Order');
const OrderAddress = require('../models/OrderAddress');
const OrderItem = require('../models/OrderItem');
const Size = require('../models/ProductSize');
const Country = require('../models/Country');
const Product = require('../models/Product');
const ProductStock = require('../models/ProductStock');
const User = require('../models/User');

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


        stockChanges = await updateProductStocks(productIds, stockChanges);


        const savedOrderAddress = await verifyAndAddOrderAddress(countryId, restAddress, savedOrder._id);


        savedOrder.orderAddress = savedOrderAddress._id;
        await savedOrder.save();

        res.status(201).json(savedOrder);

    } catch (error) {
        console.error('Error creando la ordenn:', error.message);

        await handleOrderError(savedOrder, insertedOrderItems, stockChanges);
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

const updateProductStocks = async (productIds, stockChanges) => {
    const sizeNames = [...new Set(productIds.map(p => p.size))];
    const sizes = await Size.find({ name: { $in: sizeNames } });
    const sizeMap = sizes.reduce((acc, size) => {
        acc[size.name] = size._id;
        return acc;
    }, {});


    const missingSizes = sizeNames.filter(name => !sizeMap[name]);
    if (missingSizes.length > 0) {
        throw new Error(`No se encontraron los siguientes tamaños: ${missingSizes.join(', ')}`);
    }

    const productIdsSet = [...new Set(productIds.map(p => p.productId))];


    const products = await Product.find({ _id: { $in: productIdsSet } });
    const productsMap = products.reduce((acc, product) => {
        acc[product._id.toString()] = product.name;
        return acc;
    }, {});

    return await Promise.all(productIds.map(async (p) => {
        const sizeId = sizeMap[p.size];
        const productStock = await ProductStock.findOne({ product: p.productId, size: sizeId });
        if (!productStock) {
            const productName = productsMap[p.productId.toString()]
            throw new Error(`No se encontró stock para el producto ${productName} con la talla ${p.size}`);
        }

        const originalQuantity = productStock.quantity;
        productStock.quantity -= p.quantity;
        if (productStock.quantity < 0) {
            const productName = productsMap[p.productId.toString()]
            throw new Error(`El producto ${productName} con talla ${p.size} no tiene suficiente stock`);
        }

        stockChanges.push({
            productStockId: productStock._id,
            originalQuantity,
            newQuantity: productStock.quantity,
        });

        return productStock.save();
    }));
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


const handleOrderError = async (order, orderItems, stockChanges) => {
    if (order) {
        await Order.findByIdAndDelete(order._id);
    }
    if (orderItems && orderItems.length > 0) {
        const orderItemIds = orderItems.map(item => item._id);
        await OrderItem.deleteMany({ _id: { $in: orderItemIds } });
    }
    for (const change of stockChanges) {
        await ProductStock.findByIdAndUpdate(change.productStockId, { quantity: change.originalQuantity });
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
        const order = await Order.findById(id)
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
            })

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
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
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }


        order.subTotal = subTotal || order.subTotal;
        order.tax = tax || order.tax;
        order.total = total || order.total;
        order.itemsInOrder = itemsInOrder || order.itemsInOrder;
        order.isPaid = isPaid || order.isPaid;
        order.paidAt = paidAt || order.paidAt;
        order.user = user || order.user;
        order.orderItems = orderItems || order.orderItems;
        order.orderAddress = orderAddress || order.orderAddress;
        order.transactionId = transactionId || order.transactionId;


        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: 'Error updating order', error });
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
    getAllOrders,
    getOrdersPaginatedByUser,
    getOrderById,
    getOrdersByUserId,
    updateOrder,
    deleteOrder,
};
