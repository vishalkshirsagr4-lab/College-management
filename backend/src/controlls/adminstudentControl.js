const User = require("../models/user");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");

const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      loginID,
      password,
      department,
      semester,
      subjects,
      section,
      rollNo,
      phone,
      address,
      admissionYear,
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

    // delete student profile
    await Student.findByIdAndDelete(studentId);

    // delete user login also
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

module.exports = { createStudent, updateStudent, deleteStudent };