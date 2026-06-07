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
    academicYear: {
      type: String,
      default: '',
    },
    semester: {
      type: Number,
      default: 1,
    },
    department: {
      type: String,
      default: 'General',
    },
    section: {
      type: String,
      default: 'A',
    },
    phone: {
      type: String,
      default: '',
    },
    address: String,
    emergencyContact: String,
    emergencyContactPhone: String,
    photo: {
      url: String,
      key: String,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
