const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['medical', 'personal', 'emergency'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);
