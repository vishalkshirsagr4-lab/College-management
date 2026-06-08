const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const User = require('../models/user');

async function seedAdmin() {
  try {
    const name = process.env.SEED_ADMIN_NAME || 'Admin';
    const email = process.env.SEED_ADMIN_EMAIL;
    const loginID = process.env.SEED_ADMIN_LOGIN_ID;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !loginID || !password) {
      throw new Error(
        'SEED_ADMIN_EMAIL, SEED_ADMIN_LOGIN_ID and SEED_ADMIN_PASSWORD are required'
      );
    }

    const existingAdmin = await User.findOne({
      $or: [{ email }, { loginID }],
      role: 'admin',
    });

    if (existingAdmin) {
      console.log('Admin already exists');

      const passwordMatches = await bcrypt.compare(
        password,
        existingAdmin.password
      );

      if (!passwordMatches) {
        existingAdmin.password = await bcrypt.hash(password, 10);
        existingAdmin.isVerified = true;

        await existingAdmin.save();

        console.log('Admin password updated');
      }

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      loginID,
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
    console.log('Login ID:', admin.loginID);
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

module.exports = seedAdmin;

if (require.main === module) {
  (async () => {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI missing in .env');
      }

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