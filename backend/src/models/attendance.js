const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    timetableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    section: String,
    period: Number,
    entries: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        status: { type: String, enum: ['present', 'absent', 'late', 'medical', 'approved'], default: 'absent' },
        reason: String,
      },
    ],
    meta: {
      status: { type: String, enum: ['conducted', 'cancelled', 'teacher-absent', 'college-event', 'holiday'], default: 'conducted' },
      cancelledBy: String,
      cancelledReason: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
