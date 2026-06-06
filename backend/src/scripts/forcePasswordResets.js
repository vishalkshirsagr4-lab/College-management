const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/user');
const OTP = require('../models/otp');
const { sendOTP } = require('../config/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

async function run({ send = false } = {}) {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in environment');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let created = 0;
    for (const user of users) {
      // remove existing reset OTPs for this email
      await OTP.deleteMany({ email: user.email, type: 'reset' });

      const otp = generateOTP();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      await OTP.create({ email: user.email, otp, type: 'reset', expiresAt });
      created++;

      console.log(`Created reset OTP for ${user.email}: ${otp}`);

      if (send) {
        try {
          await sendOTP(user.email, otp);
          console.log(`Sent OTP to ${user.email}`);
        } catch (err) {
          console.error(`Failed to send OTP to ${user.email}:`, err.message || err);
        }
      }
    }

    console.log(`Done. Created ${created} reset OTP records. ${send ? 'OTP emails attempted.' : 'Dry-run (no emails sent). Use --send to email OTPs).'} `);
  } catch (err) {
    console.error('Error creating reset OTPs:', err.message || err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// CLI
const args = process.argv.slice(2);
const send = args.includes('--send');

run({ send });

module.exports = run;
