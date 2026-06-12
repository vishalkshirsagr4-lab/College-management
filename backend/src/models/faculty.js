const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },
    // Public S3 URL
    profileImage: {
      type: String,
      default: "",
    },
    // S3 object key (for delete)
    profileKey: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    teachingAssignments: [
      {
        department: { type: String, default: "" },
        semester: { type: Number, min: 1 },
        section: { type: String, default: "" },
        subjects: { type: [String], default: [] },
      },
    ],
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Faculty", facultySchema);