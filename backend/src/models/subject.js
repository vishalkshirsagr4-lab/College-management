const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      unique: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
