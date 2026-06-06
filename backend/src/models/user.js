const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      required: true,
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpire: Date,
    isBlocked: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      url: String,
      key: String,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  // If the password already looks like a bcrypt hash, skip re-hashing.
  // This avoids double-hashing when a hashed password (for example from an OTP
  // verification flow) is assigned directly to the user before save.
  if (typeof this.password === 'string' && /^\$2[aby]\$/.test(this.password)) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);