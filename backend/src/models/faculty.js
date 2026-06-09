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
    profileImage: {
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
          department: String,
          semester: Number,
          section: String,
          subjects: [String],
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