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
        semester: {
          type: Number,
          required: true,
        },

        subjects: [
          {
            type: String,
            required: true,
            trim: true,
          },
        ],
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