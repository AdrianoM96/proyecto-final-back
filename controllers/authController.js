const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createAccessToken } = require('../libs/jwt');

const registerUser = async (req, res) => {
    const { name, email, password, image } = req.body;
    const role = 'user';

    try {

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }


        user = new User({
            name,
            email,
            password,
            image,
            role,
        });


        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const userWithoutPassword = await User.findById(user._id).select('-password');

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = await createAccessToken({
            payload
        });


        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "None",
            domain: 'localhost',
            maxAge: 1000 * 60 * 60 * 24
        });

        res.json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

const authenticateUser = async (req, res) => {
    const { email, password } = req.body;
    try {


        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const userWithoutPassword = await User.findOne({ email }).select('-password');


        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = await createAccessToken({
            payload
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "None",
            domain: 'localhost',
            maxAge: 1000 * 60 * 60 * 24
        });

        res.json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error3');
    }
};

const verifyToken = async (req, res) => {

    const token = req.headers.authorization;


    if (!token) return res.send(false);

    jwt.verify(token, process.env.JWT_SECRET, async (error, user) => {
        if (error) return res.sendStatus(401);

        const userFound = await User.findById(user.payload.user.id);
        if (!userFound) return res.sendStatus(401);


        return res.json({
            user: userFound
        });
    });
};

const logout = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: false,
        domain: 'localhost',
        expires: new Date(0),
    });

    return res.sendStatus(200)
};


const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    registerUser,
    authenticateUser,
    getUser,
    verifyToken,
    logout
};
