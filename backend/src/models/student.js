const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    profileKey: { // Added to match your controller's S3 deletion logic safely
      type: String,
      default: "",
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    rollNo: {
      type: String,
      required: true,
      unique: true,
    },
    loginID: {
      type: String,
      required: true,
      unique: true,
    },
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    bloodGroup: {
      type: String,
    },
    admissionYear: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: String,
      default: "2026-27",
    },
    parentName: String,
    parentPhone: String,
    guardianEmail: String,
    attendancePercentage: {
      type: Number,
      default: 0,
    },
    cgpa: {
      type: Number,
      default: 0,
    },
    feeStatus: {
      type: String,
      enum: ["Paid", "Pending", "Partial"],
      default: "Pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);