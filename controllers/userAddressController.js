const UserAddress = require('../models/UserAddress');
const User = require('../models/User');
const Country = require('../models/Country');

const createUserAddress = async (req, res) => {
    const { firstName, lastName, address, address2, postalCode, phone, city, country: countryId, user: userId } = req.body;


    try {

        const userBd = await User.findById(userId);
        const countryObj = await Country.findById(countryId);


        if (!userBd || !countryObj) {
            return res.status(404).json({ message: 'User or Country not found' });
        }

        const userAddress = new UserAddress({
            firstName,
            lastName,
            address,
            address2,
            postalCode,
            phone,
            city,
            country: countryObj._id,
            user: userBd._id,
        });

        const savedAddress = await userAddress.save();


        userBd.address.push(savedAddress._id);
        await userBd.save();

        res.status(201).json(savedAddress);

    } catch (error) {
        console.error("Error creating user address:", error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', error: error.message });
        } else if (error.name === 'MongoError') {
            res.status(500).json({ message: 'Database Error', error: error.message });
        } else {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};


const getUserAddresses = async (req, res) => {
    try {
        const addresses = await UserAddress.find().populate('country').populate('user');
        res.status(200).json(addresses);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching user addresses', error });
    }
};

const getUserAddressById = async (req, res) => {
    const { id } = req.params;



    try {
        const address = await UserAddress.findById(id).populate('country').populate('user');
        if (!address) {
            return res.status(404).json({ message: 'User address not found GET' });
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching user address', error });
    }
};

const getUserAddressByUser = async (req, res) => {
    const { id } = req.params;


    try {

        const address = await UserAddress.findOne({ user: id }).populate('country').populate('user');


        if (!address) {
            return res.status(404).json({ message: 'User address not found GET' });
        }

        res.status(200).json(address);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching user address', error });
    }
};



const updateUserAddress = async (req, res) => {

    const { id } = req.params;
    const { firstName, lastName, address, address2, postalCode, phone, city, country, user } = req.body;

    try {
        const addressDoc = await UserAddress.findById(id);
        if (!addressDoc) {
            return res.status(404).json({ message: 'User address not found UPDATE' });
        }

        addressDoc.firstName = firstName || addressDoc.firstName;
        addressDoc.lastName = lastName || addressDoc.lastName;
        addressDoc.address = address || addressDoc.address;
        addressDoc.address2 = address2 || addressDoc.address2;
        addressDoc.postalCode = postalCode || addressDoc.postalCode;
        addressDoc.phone = phone || addressDoc.phone;
        addressDoc.city = city || addressDoc.city;
        addressDoc.country = country || addressDoc.country;
        addressDoc.user = user || addressDoc.user;

        await addressDoc.save();

        res.status(200).json(addressDoc);
    } catch (error) {
        res.status(400).json({ message: 'Error updating user address', error });
    }
};

const deleteUserAddress = async (req, res) => {
    const { id } = req.params;

    try {
        const address = await UserAddress.findByIdAndDelete(id);
        if (!address) {
            return res.status(404).json({ message: 'User address not found' });
        }

        await User.updateOne(
            { _id: address.user },
            { $pull: { address: id } }
        );


        res.status(200).json({ message: 'User address removed' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user address', error });
    }
};

module.exports = {
    createUserAddress,
    getUserAddresses,
    getUserAddressById,
    getUserAddressByUser,
    updateUserAddress,
    deleteUserAddress,
};
