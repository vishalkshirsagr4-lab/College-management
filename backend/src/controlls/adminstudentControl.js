const mongoose = require("mongoose");
const User = require("../models/user");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const { deleteFromS3 } = require("../config/s3");

const createStudent = async (req, res) => {
  let createdUser = null;

  try {
    // Strict body validation
    const required = [
      "name",
      "email",
      "loginID",
      "password",
      "department",
      "semester",
      "section",
      "rollNo",
      "phone",
      "address",
      "admissionYear",
    ];

    for (const key of required) {
      if (req.body?.[key] === undefined || req.body?.[key] === null || req.body?.[key] === "") {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${key}`,
        });
      }
    }

    console.log("[createStudent] body keys present:", Object.keys(req.body || {}));
    const {
      name,
      email,
      loginID,
      password,
      department,
      semester,
      section,
      rollNo,
      phone,
      address,
      admissionYear,
      gender,
      dateOfBirth,
      bloodGroup,
    } = req.body;

    // Check if EITHER email OR loginID is already occupied
    const existingUser = await User.findOne({ $or: [{ email }, { loginID }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.loginID === loginID ? "Login ID already exists" : "Email already exists",
      });
    }

    // Check student roll no
    const existingRollNo = await Student.findOne({ rollNo });
    if (existingRollNo) {
      return res.status(400).json({
        success: false,
        message: "Roll Number already exists",
      });
    }

    let profileImage = "";
    let profileKey = "";

    // Upload profile image metadata if provided by multer-s3
    if (req.file) {
      profileImage = req.file.location || req.file.url || "";
      profileKey = req.file.key || "";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user core profile
    createdUser = await User.create({
      name,
      email,
      loginID,
      password: hashedPassword,
      role: "student",
    });

    const studentUserId = createdUser._id;

    // Prevent duplicate Student portal doc for the same user
    const existingStudentForUser = await Student.findOne({ userID: studentUserId });
    if (existingStudentForUser) {
      // Manual Rollback if hit
      await User.findByIdAndDelete(studentUserId);
      return res.status(409).json({
        success: false,
        message: "Student portal already exists for this user",
        studentId: existingStudentForUser._id,
      });
    }

    const student = await Student.create({
      userID: studentUserId,
      profileImage,
      profileKey,
      department,
      semester,
      section,
      rollNo,
      loginID,
      phone,
      address,
      admissionYear,
      gender,
      dateOfBirth,
      bloodGroup,
      subjects: [],
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
      credentials: {
        loginID,
        password,
      },
    });
  } catch (error) {
    console.error("[createStudent] Create Student Error:", error);

    // Rollback user entry if collection linkage fails mid-execution
    if (createdUser) {
      await User.findByIdAndDelete(createdUser._id);
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate student record detected (unique constraint failed)",
        details: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Defensive programming: Do not allow direct payload updates to mutable systems identifiers blindly
    const { userID, loginID, rollNo, ...updatableFields } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updatableFields },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Clear assets out from AWS S3 storage securely 
    const targetAssetFile = student.profileKey || student.profileImage;
    if (targetAssetFile) {
      try {
        await deleteFromS3(targetAssetFile);
      } catch (s3Err) {
        console.error("Non-blocking S3 asset clearance error:", s3Err.message);
      }
    }

    // Perform operational data deletions across both collections
    if (student.userID) {
      await User.findByIdAndDelete(student.userID);
    }
    await Student.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing required properties" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate(
      "userID",
      "name email loginID role"
    );

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate(
      "userID",
      "name email loginID role"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStudentProfileImage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image required",
      });
    }

    // Delete previous asset tracking info out of bucket store
    const previousAsset = student.profileKey || student.profileImage;
    if (previousAsset) {
      try {
        await deleteFromS3(previousAsset);
      } catch (err) {
        console.error("S3 clear warning:", err.message);
      }
    }

    // Save configuration references securely
    student.profileImage = req.file.location || req.file.url || "";
    student.profileKey = req.file.key || "";
    await student.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated",
      profileImage: student.profileImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createStudent,
  updateStudent,
  deleteStudent,
  resetPassword,
  getAllStudents,
  getStudentById,
  updateStudentProfileImage,
};