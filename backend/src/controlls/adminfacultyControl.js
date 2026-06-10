const User = require("../models/user");
const Faculty = require("../models/faculty");
const bcrypt = require("bcryptjs");
const { uploadToS3, deleteFromS3 } = require("../config/s3"); // Imported deleteFromS3 for image management
const fs = require("fs");

const createFaculty = async (req, res) => {
  try {
    console.log("teachingAssignments:", req.body.teachingAssignments);
    console.log("type:", typeof req.body.teachingAssignments);

    const { name, email, loginID, password, department, designation, phone } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { loginID }] });
    if (existingUser) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Faculty already exists" });
    }

    let parsedAssignments = [];
    if (req.body.teachingAssignments) {
      if (typeof req.body.teachingAssignments === "string") {
        try {
          parsedAssignments = JSON.parse(req.body.teachingAssignments);
        } catch (e) {
          if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(400).json({ success: false, message: "Invalid teachingAssignments format" });
        }
      } else if (Array.isArray(req.body.teachingAssignments)) {
        parsedAssignments = req.body.teachingAssignments;
      }
    }

    let profileImage = "";
    if (req.file) {
      const result = await uploadToS3(req.file.path, "faculty-profiles");
      profileImage = result.url;
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
      phone,
      profileImage,
      teachingAssignments: parsedAssignments.map(a => ({
        department: String(a.department || "").trim(),
        semester: Number(a.semester),
        section: String(a.section || "").trim(),
        subjects: Array.isArray(a.subjects) ? a.subjects.map(s => String(s).trim()) : []
      }))
    });

    res.status(201).json({ success: true, message: "Faculty created successfully", data: { user, faculty } });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Core Profile Update Function (Handles Name, Email, Phone, Dept, Designation)
const updateFacultyDetails = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { name, email, department, designation, phone } = req.body;

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty profile not found" });
    }

    // 1. Cross-verify if the administrator is trying to change the email to one that is taken
    if (email) {
      const emailConflict = await User.findOne({ email, _id: { $ne: faculty.userID } });
      if (emailConflict) {
        return res.status(400).json({ success: false, message: "Email is already in use by another user" });
      }
    }

    // 2. Safely patch the associated primary identity login user document
    if (faculty.userID) {
      const userUpdateFields = {};
      if (name !== undefined) userUpdateFields.name = name.trim();
      if (email !== undefined) userUpdateFields.email = email.trim();

      if (Object.keys(userUpdateFields).length > 0) {
        await User.findByIdAndUpdate(faculty.userID, userUpdateFields);
      }
    }

    // 3. Update the primary parameters mapping fields inside the Faculty sub-profile record
    if (department !== undefined) faculty.department = department.trim();
    if (designation !== undefined) faculty.designation = designation.trim();
    if (phone !== undefined) faculty.phone = phone.trim();

    await faculty.save();

    // 4. Return the fully refreshed record structure
    const updatedFaculty = await Faculty.findById(facultyId).populate("userID", "name email loginID role");

    res.status(200).json({
      success: true,
      message: "Faculty profile information updated successfully",
      faculty: updatedFaculty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFacultySemester = async (req, res) => {
  try {
    const facultyId = req.params.facultyId || req.body.facultyId;
    const { semester, subjects, teachingAssignments } = req.body;

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty profile not found" });
    }

    if (teachingAssignments && Array.isArray(teachingAssignments)) {
      faculty.teachingAssignments = teachingAssignments.map(a => ({
        department: String(a.department || "").trim(),
        semester: Number(a.semester),
        section: String(a.section || "").trim(),
        subjects: Array.isArray(a.subjects) ? a.subjects.map(s => String(s).trim()) : []
      }));
    } else {
      if (!semester || !subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ success: false, message: "Semester and subjects properties are required" });
      }

      const index = faculty.teachingAssignments.findIndex(item => item.semester === Number(semester));
      if (index !== -1) {
        faculty.teachingAssignments[index].subjects = subjects.map(s => String(s).trim());
      } else {
        faculty.teachingAssignments.push({
          semester: Number(semester),
          department: faculty.department,
          section: "A", 
          subjects: subjects.map(s => String(s).trim())
        });
      }
    }

    await faculty.save();
    const updatedFaculty = await Faculty.findById(facultyId).populate("userID", "name email loginID role");

    res.status(200).json({
      success: true,
      message: "Teaching assignments synchronized successfully",
      faculty: updatedFaculty,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSemester = async (req, res) => {
  try {
    const { facultyId, semester } = req.body;
    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    faculty.teachingAssignments = faculty.teachingAssignments.filter(
      item => item.semester !== Number(semester)
    );

    await faculty.save();
    const updatedFaculty = await Faculty.findById(facultyId).populate("userID", "name email loginID role");

    res.status(200).json({
      success: true,
      message: `Semester ${semester} assignments wiped successfully`,
      faculty: updatedFaculty,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().populate("userID", "name email loginID role");
    res.status(200).json({ success: true, count: faculty.length, faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const faculty = await Faculty.findById(facultyId).populate("userID", "name email loginID role");

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty record not found" });
    }

    res.status(200).json({ success: true, faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFacultyProfileImage = async (req, res) => {
  try {
    const { facultyId } = req.body;
    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Profile image is required" });
    }

    // Clean old S3 upload reference trace out if it exists
    if (faculty.profileImage) {
      try {
        await deleteFromS3(faculty.profileImage);
      } catch (s3Err) {
        console.error("Old S3 profile image cleanup skipped:", s3Err.message);
      }
    }

    const result = await uploadToS3(req.file.path, "faculty-profiles");
    faculty.profileImage = result.url;
    await faculty.save();

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: faculty.profileImage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFacultyProfileImage = async (req, res) => {
  try {
    const { facultyId } = req.body;
    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    if (faculty.profileImage) {
      try {
        await deleteFromS3(faculty.profileImage);
      } catch (s3Err) {
        console.error("S3 image execution file dump skipped:", s3Err.message);
      }
    }

    faculty.profileImage = "";
    await faculty.save();

    res.status(200).json({ success: true, message: "Profile image deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty record not found" });
    }

    if (faculty.userID) {
      await User.findByIdAndDelete(faculty.userID);
    }

    if (faculty.profileImage) {
      try {
        await deleteFromS3(faculty.profileImage);
      } catch (s3Err) {
        console.error("S3 asset removal skipped:", s3Err.message);
      }
    }

    await Faculty.findByIdAndDelete(facultyId);

    res.status(200).json({
      success: true,
      message: "Faculty and associated user account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFaculty,
  updateFacultyDetails, // <-- Exported update details function
  updateFacultySemester,
  deleteSemester,
  getAllFaculty,
  getFacultyById,
  updateFacultyProfileImage,
  deleteFacultyProfileImage,
  deleteFaculty,
};