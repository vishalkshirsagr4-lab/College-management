const mongoose = require("mongoose");

const examSubjectSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    syllabus: [
      {
        unit: String,
        chapters: [String],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamSubject", examSubjectSchema);