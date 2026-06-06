const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/user');

async function seedAdmin() {
  try {
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const email = process.env.SEED_ADMIN_EMAIL || 'vishalkshirsagr4@gmail.com';
    const name = process.env.SEED_ADMIN_NAME || 'Admin';

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      profileImage: {
        url: '',
        key: '',
      },
    });

    console.log('✓ Admin created successfully');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    throw error;
  }
}

// Allow running this script directly: `node seedAdmin.js`
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
      await seedAdmin();
    } catch (err) {
      console.error(err);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      process.exit(0);
    }
  })();
}

module.exports = seedAdmin;
