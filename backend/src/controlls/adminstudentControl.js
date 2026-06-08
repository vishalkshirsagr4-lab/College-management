const User = require("../models/user");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const { uploadToS3, deleteFromS3 } = require("../config/s3");
const fs = require("fs");

const createStudent = async (req, res) => {
  try {
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

    const existingUser = await User.findOne({
      $or: [{ email }, { loginID }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Student already exists",
      });
    }

    let profileImage = "";

    // ✅ Upload image if exists
    if (req.file) {
      const result = await uploadToS3(
        req.file.path,
        "student-profiles"
      );

      profileImage = result.url;

      fs.unlinkSync(req.file.path);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      loginID,
      password: hashedPassword,
      role: "student",
    });

    const student = await Student.create({
      userID: user._id,
      department,
      semester,
      section,
      rollNo,
      loginID,
      phone,
      address,
      admissionYear,
      subjects: [],
      profileImage, // ✅ added
      gender,
      dateOfBirth,
      bloodGroup,
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
      credentials: {
        loginID,
        password,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      req.body,
      { new: true }
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
        message: "Student not found",
      });
    }

    // delete profile image from S3
    if (student.profileImage) {
      await deleteFromS3(student.profileImage);
    }

    await Student.findByIdAndDelete(studentId);
    await User.findByIdAndDelete(student.userID);

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

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

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

    if (student.profileImage) {
      await deleteFromS3(student.profileImage);
    }

    const result = await uploadToS3(
      req.file.path,
      "student-profiles"
    );

    student.profileImage = result.url;

    await student.save();

    fs.unlinkSync(req.file.path);

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

module.exports = { createStudent, updateStudent, deleteStudent , resetPassword , getAllStudents , getStudentById , updateStudentProfileImage };