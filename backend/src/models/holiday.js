const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, enum: ['national', 'festival', 'college', 'semester-break'], default: 'college' },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Holiday', holidaySchema);
