const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/user');

async function seedAdmin() {
  try {
    const password = process.env.SEED_ADMIN_PASSWORD;
    const email = process.env.SEED_ADMIN_EMAIL;
    const name = process.env.SEED_ADMIN_NAME || 'Admin';

    const existingAdmin = await User.findOne({ email, role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);

      const passwordMatches = await bcrypt.compare(password, existingAdmin.password);
      if (!passwordMatches) {
        existingAdmin.password = password;
        existingAdmin.isVerified = true;
        await existingAdmin.save();
        console.log('Admin password updated from SEED_ADMIN_PASSWORD.');
      }

      return;
    }

    const admin = await User.create({
      name,
      email,
      password,
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
