
const User = require('../models/User');
const bcrypt = require('bcryptjs');


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('address').populate('orders');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getPaginatedAllUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const users = await User.find()
            .skip(startIndex)
            .limit(limit)
            .select('role email name')


        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);
        res.status(200).json({
            currentPage: page,
            totalPages,
            users
        });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching users', error });
    }
};


const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('address').populate('orders');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateRoleUser = async (req, res) => {
    const { id } = req.params
    const { role } = req.body


    try {
        const updatedUser = await User.findByIdAndUpdate(id, { role: role }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updatePasswordUser = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    let user = await User.findOne({ _id: id });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    try {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);


        const updatedUser = await User.findByIdAndUpdate(
            id,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error("Error actualizando contraseña:", error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};




const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getPaginatedAllUser,
    getAllUsers,
    getUserById,
    createUser,
    updatePasswordUser,
    updateRoleUser,
    deleteUser
};
