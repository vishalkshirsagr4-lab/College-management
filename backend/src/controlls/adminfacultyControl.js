const User = require("../models/user");
const Faculty = require("../models/faculty");
const bcrypt = require("bcryptjs");
const { uploadToS3 } = require("../config/s3");
const fs = require("fs");


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
    
    let profileImage = "";

    // ✅ Upload image to S3 if provided
    if (req.file) {
      const result = await uploadToS3(
        req.file.path,
        "faculty-profiles"
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
      role: "faculty",
    });

    const faculty = await Faculty.create({
      userID: user._id,
      department,
      designation,
      teachingAssignments,
      phone,
      profileImage,
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

    // Validate input
    if (!semester || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({
        success: false,
        message: "Semester and subjects are required",
      });
    }

    // Find semester index
    const index = faculty.teachingAssignments.findIndex(
      (item) => item.semester === semester
    );

    // UPDATE existing semester
    if (index !== -1) {
      faculty.teachingAssignments[index].subjects = subjects;
    } 
    // ADD new semester
    else {
      faculty.teachingAssignments.push({
        semester,
        subjects,
      });
    }

    await faculty.save();

    res.status(200).json({
      success: true,
      message: `Semester ${semester} subjects updated successfully`,
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

const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .populate("userID", "name email loginID role");

    res.status(200).json({
      success: true,
      count: faculty.length,
      faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Faculty.findById(facultyId)
      .populate("userID", "name email loginID role");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateFacultyProfileImage = async (req, res) => {
  try {
    const { facultyId } = req.body;

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    // Delete old image from S3
    if (faculty.profileImage) {
      await deleteFromS3(faculty.profileImage);
    }

    // Upload new image
    const result = await uploadToS3(
      req.file.path,
      "faculty-profiles"
    );

    faculty.profileImage = result.url;

    await faculty.save();

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: faculty.profileImage,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteFacultyProfileImage = async (req, res) => {
  try {
    const { facultyId } = req.body;

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    if (!faculty.profileImage) {
      return res.status(400).json({
        success: false,
        message: "No profile image found",
      });
    }

    await deleteFromS3(faculty.profileImage);

    faculty.profileImage = "";

    await faculty.save();

    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
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
  getAllFaculty,
  getFacultyById,
  updateFacultyProfileImage,
  deleteFacultyProfileImage,
};