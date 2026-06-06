const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    course: String,
    semester: Number,
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    day: { type: String, required: true }, // e.g., Monday
    period: { type: Number, required: true },
    startTime: String, // HH:MM
    endTime: String,
    section: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
