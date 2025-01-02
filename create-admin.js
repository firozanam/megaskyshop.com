require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword123';

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create new admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const newAdmin = new User({
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            isAdmin: true
        });

        await newAdmin.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createAdminUser();
