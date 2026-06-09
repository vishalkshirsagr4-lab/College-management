const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },

    senderRole: {
      type: String,
      enum: ["admin", "faculty"],
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // all | department | semester | section
    target: {
      type: String,
      enum: ["all", "department", "semester", "section"],
      default: "all",
      required: true,
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    semester: {
      type: Number,
      default: null,
    },

    section: {
      type: String,
      trim: true,
      default: "",
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

