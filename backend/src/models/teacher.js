const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: String,
      default: 'Computer Science',
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    photo: {
      url: String,
      key: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
