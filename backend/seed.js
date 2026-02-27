const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (adminExists) {
            console.log('Admin already exists!');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Bypass the pre-save hook since we hash it here, but it's simpler to just let mongoose hook handle it
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@example.com',
            password: 'admin123', // Mongoose pre-save will hash this
            role: 'Admin',
            phone: '1234567890'
        });

        console.log('Admin seeded successfully:', admin.email);
        process.exit();
    } catch (error) {
        console.error('Error with seed:', error);
        process.exit(1);
    }
};

seedAdmin();
