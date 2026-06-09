const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    department: String,
    semester: Number,
    section: String,

    subject: String,

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    session: {
      type: String,
      enum: ["Morning", "Afternoon"],
      required: true,
    },

    date: {
      type: String, // store YYYY-MM-DD (important)
      required: true,
    },

    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        status: {
          type: String,
          enum: ["Present", "Absent"],
          default: "Present",
        },
      },
    ],
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate attendance per session/day/subject/faculty
attendanceSchema.index(
  { subject: 1, date: 1, session: 1, facultyId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);