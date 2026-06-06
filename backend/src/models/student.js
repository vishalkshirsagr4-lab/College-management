const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    usn: {
      type: String,
      required: true,
      unique: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    photo: {
      url: String,
      key: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
