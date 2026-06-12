const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
    },
    section: {
      type: String,
      trim: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    // Public S3 URL (for direct access)
    fileUrl: {
      type: String,
      default: "",
    },
    // S3 object key (for delete functionality)
    fileKey: {
      type: String,
      default: "",
    },


    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ department: 1, semester: 1, section: 1 });
assignmentSchema.index({ facultyId: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);

