const OrderAddress = require('../models/OrderAddress');
const Order = require('../models/Order');
const Country = require('../models/Country');

const createOrderAddress = async (req, res) => {
    const { firstName, lastName, address, address2, postalCode, city, phone, countryId, orderId } = req.body;

    try {
        const order = await Order.findById(orderId);
        const country = await Country.findById(countryId);

        if (!order || !country) {
            return res.status(404).json({ message: 'Order or Country not found' });
        }

        const orderAddress = new OrderAddress({
            firstName,
            lastName,
            address,
            address2,
            postalCode,
            city,
            phone,
            country: countryId,
            order: orderId,
        });

        await orderAddress.save();


        order.orderAddress = orderAddress._id;
        await order.save();

        res.status(201).json(orderAddress);
    } catch (error) {
        res.status(400).json({ message: 'Error creating order address', error });
    }
};

const getOrderAddresses = async (req, res) => {
    try {
        const addresses = await OrderAddress.find().populate('country').populate('order');
        res.status(200).json(addresses);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching order addresses', error });
    }
};

const getOrderAddressById = async (req, res) => {
    const { id } = req.params;

    try {
        const address = await OrderAddress.findById(id).populate('country').populate('order');
        if (!address) {
            return res.status(404).json({ message: 'Order address not found' });
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching order address', error });
    }
};

const updateOrderAddress = async (req, res) => {

    const { id } = req.params;
    const { firstName, lastName, address, address2, postalCode, city, phone, countryId, orderId } = req.body;

    try {
        const addressDoc = await OrderAddress.findById(id);
        if (!addressDoc) {
            return res.status(404).json({ message: 'User address not found' });
        }

        addressDoc.firstName = firstName || addressDoc.firstName;
        addressDoc.lastName = lastName || addressDoc.lastName;
        addressDoc.address = address || addressDoc.address;
        addressDoc.address2 = address2 || addressDoc.address2;
        addressDoc.postalCode = postalCode || addressDoc.postalCode;
        addressDoc.city = city || addressDoc.city;
        addressDoc.phone = phone || addressDoc.phone;
        addressDoc.country = countryId || addressDoc.country;
        addressDoc.order = orderId || addressDoc.order;

        await addressDoc.save();

        res.status(200).json(addressDoc);
    } catch (error) {
        res.status(400).json({ message: 'Error updating order address', error });
    }
};

const deleteOrderAddress = async (req, res) => {
    const { id } = req.params;

    try {
        const address = await OrderAddress.findByIdAndDelete(id);
        if (!address) {
            return res.status(404).json({ message: 'Order address not found' });
        }

        res.status(200).json({ message: 'Order address removed' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting order address', error });
    }
};

module.exports = {
    createOrderAddress,
    getOrderAddresses,
    getOrderAddressById,
    updateOrderAddress,
    deleteOrderAddress,
};
