const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Unpaid'],
      required: true,
      default: 'Unpaid',
    },
    paymentDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);
