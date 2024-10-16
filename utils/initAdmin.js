const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdminUser = async () => {
    const name = 'admin';
    const email = 'admin@admin.com';
    const password = 'admin123';
    const role = 'admin';

    try {
        let adminUser = await User.findOne({ email });

        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            adminUser = new User({
                name,
                email,
                password: hashedPassword,
                role
            });

            await adminUser.save();

        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

module.exports = { createAdminUser };
