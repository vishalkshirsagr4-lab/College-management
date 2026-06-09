const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    semester: {
      type: Number,
      required: true,
    },

    section: {
      type: String,
      required: true,
    },

    day: {
      type: String,
      enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      required: true,
    },

    periodNo: {
      type: Number,
      required: true,
    },

    startTime: String,
    endTime: String,

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    subjectName: String,

    room: String,
  },
  { timestamps: true }
);


timetableSchema.index(
  { facultyId: 1, day: 1, periodNo: 1 },
  { unique: true }
);

const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = Timetable;