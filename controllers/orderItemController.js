const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Order = require('../models/Order');
const createOrderItem = async (req, res) => {
    const { quantity, price, size, order, product } = req.body;

    try {
        const orderDoc = await Order.findById(order);
        if (!orderDoc) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const productDoc = await Product.findById(product);
        if (!productDoc) {
            return res.status(404).json({ message: 'product not found' });
        }

        const orderItem = new OrderItem({
            quantity,
            price,
            size,
            order,
            product,
        });

        const savedOrderItem = await orderItem.save();


        orderDoc.orderItems.push(savedOrderItem._id);
        await orderDoc.save();

        res.status(201).json(savedOrderItem);
    } catch (error) {
        console.error('Error creating order item:', error);
        res.status(400).json({ message: 'Error creating order item', error });
    }
};

const getOrderItems = async (req, res) => {
    try {
        const items = await OrderItem.find().populate('order').populate('product');
        res.status(200).json(items);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching order items', error });
    }
};

const getOrderItemById = async (req, res) => {
    const { id } = req.params;

    try {
        const item = await OrderItem.findById(id).populate('order').populate('product');
        if (!item) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching order item', error });
    }
};

const updateOrderItem = async (req, res) => {
    const { id } = req.params;
    const { quantity, price, size, orderId, productId } = req.body;

    try {
        const item = await OrderItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        item.quantity = quantity || item.quantity;
        item.price = price || item.price;
        item.size = size || item.size;
        item.order = orderId || item.order;
        item.product = productId || item.product;

        await item.save();

        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: 'Error updating order item', error });
    }
};
const deleteOrderItem = async (req, res) => {
    const { id } = req.params;

    try {


        const orderItem = await OrderItem.findByIdAndDelete(id);
        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }



        res.status(200).json({ message: 'Order item removed' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting order item', error });
    }
};



module.exports = {
    createOrderItem,
    getOrderItems,
    getOrderItemById,
    updateOrderItem,
    deleteOrderItem,
};
