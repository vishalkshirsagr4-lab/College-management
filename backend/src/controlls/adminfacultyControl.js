const User = require("../models/User");
const Faculty = require("../models/faculty");
const bcrypt = require("bcryptjs");


const createFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      loginID,
      password,
      department,
      designation,
      teachingAssignments,
      phone,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email },
        { loginID }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Faculty already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      loginID,
      password: hashedPassword,
      role: "faculty",
    });

    const faculty = await Faculty.create({
      userID: user._id,
      department,
      designation,
      teachingAssignments,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      faculty,
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


const updateFacultySemester = async (req, res) => {
  try {
    const { facultyId, semester, subjects } = req.body;

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const index = faculty.teachingAssignments.findIndex(
      (item) => item.semester === semester
    );

    if (index !== -1) {
      faculty.teachingAssignments[index].subjects = subjects;
    } else {
      faculty.teachingAssignments.push({
        semester,
        subjects,
      });
    }

    await faculty.save();

    res.status(200).json({
      success: true,
      message: `Semester ${semester} updated successfully`,
      faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteSemester = async (req, res) => {
  try {
    const { facultyId, semester } = req.body;

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // remove the semester completely
    faculty.teachingAssignments = faculty.teachingAssignments.filter(
      (item) => item.semester !== semester
    );

    await faculty.save();

    res.status(200).json({
      success: true,
      message: `Semester ${semester} deleted successfully`,
      faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createFaculty,
  updateFacultySemester,
  deleteSemester,
};