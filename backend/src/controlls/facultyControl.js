const Faculty = require("../models/faculty");
const Student = require("../models/student");
const Timetable = require("../models/timetable");
const User = require("../models/user");

const getFacultyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      userID: req.user.id,
    }).populate("userID", "-password");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const escapeRegExp = (str) => {
  // Escape regex special chars so faculty subject strings are treated literally
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getMyStudents = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ userID: req.user.id });

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    // 1. Collect and normalize faculty subjects (lowercase and trimmed)
    const facultySubjects = [...new Set(
      faculty.teachingAssignments
        .flatMap((a) => a?.subjects || [])
        .filter((s) => typeof s === "string" && s.trim())
        .map((s) => s.trim().toLowerCase())
    )];

    if (facultySubjects.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // 2. Aggregation Pipeline
    // We match students who have at least one subject in their array that 
    // matches (case-insensitive) any subject in the facultySubjects list.
    const students = await Student.aggregate([
      {
        $match: { isActive: true }
      },
      {
        // Add a field that normalizes student subjects for comparison
        $addFields: {
          normalizedSubjects: {
            $map: {
              input: { $ifNull: ["$subjects", []] },
              as: "sub",
              in: { $toLower: { $trim: { input: "$$sub" } } }
            }
          }
        }
      },
      {
        // Keep only students where intersection with facultySubjects exists
        $match: {
          normalizedSubjects: { $in: facultySubjects }
        }
      },
      {
        // Populate User details (MongoDB aggregation lookup)
        $lookup: {
          from: "users", // ensure this matches your MongoDB collection name
          localField: "userID",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          rollNo: 1,
          semester: 1,
          section: 1,
          subjects: 1,
          profileImage: 1,
          userID: {
            name: "$userDetails.name",
            email: "$userDetails.email"
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("getMyStudents error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyTimetable = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      userID: req.user.id,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const timetable = await Timetable.find({
      facultyId: faculty._id,
    });

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Faculty self-update endpoint
// PUT /api/faculty/profile
const updateMyFacultyProfile = async (req, res) => {
  try {
    const { name, email, phone, department, designation } = req.body || {};

    // Normalize + validate (same spirit as admin update)
    const trimOrNull = (v) => (typeof v === "string" ? v.trim() : v);

    const normalized = {
      name: name !== undefined ? trimOrNull(name) : undefined,
      email: email !== undefined ? trimOrNull(email) : undefined,
      phone: phone !== undefined ? trimOrNull(phone) : undefined,
      department: department !== undefined ? trimOrNull(department) : undefined,
      designation: designation !== undefined ? trimOrNull(designation) : undefined,
    };

    const fieldErrors = [];

    if (normalized.name !== undefined && (!normalized.name || normalized.name.length < 2)) {
      fieldErrors.push({ field: "name", reason: "Name must be at least 2 characters" });
    }

    if (normalized.email !== undefined) {
      const emailStr = String(normalized.email);
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
      if (!ok) fieldErrors.push({ field: "email", reason: "Invalid email format" });
    }

    if (normalized.department !== undefined && (!normalized.department || normalized.department.length < 1)) {
      fieldErrors.push({ field: "department", reason: "Department cannot be empty" });
    }

    if (normalized.designation !== undefined && (!normalized.designation || normalized.designation.length < 1)) {
      fieldErrors.push({ field: "designation", reason: "Designation cannot be empty" });
    }

    if (normalized.phone !== undefined && (!normalized.phone || String(normalized.phone).trim().length < 7)) {
      fieldErrors.push({ field: "phone", reason: "Phone must be at least 7 characters" });
    }

    if (fieldErrors.length) {
      return res.status(400).json({
        success: false,
        message: "Validation failed for one or more fields",
        fieldErrors,
      });
    }

    const faculty = await Faculty.findOne({ userID: req.user.id });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty profile not found" });
    }

    // Update linked User fields
    if (faculty.userID) {
      const userUpdate = {};
      if (normalized.name !== undefined) userUpdate.name = normalized.name;
      if (normalized.email !== undefined) userUpdate.email = normalized.email;

      // Email conflict check
      if (normalized.email) {
        const emailConflict = await User.findOne({
          email: normalized.email,
          _id: { $ne: faculty.userID },
        });
        if (emailConflict) {
          return res.status(400).json({
            success: false,
            message: "Email is already in use by another user",
            fieldErrors: [{ field: "email", reason: "Email already in use" }],
          });
        }
      }

      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(faculty.userID, userUpdate, { new: true });
      }
    }

    // Update Faculty fields
    if (normalized.phone !== undefined) faculty.phone = normalized.phone;
    if (normalized.department !== undefined) faculty.department = normalized.department;
    if (normalized.designation !== undefined) faculty.designation = normalized.designation;

    await faculty.save();

    const updatedFaculty = await Faculty.findById(faculty._id).populate("userID", "name email loginID role");

    return res.status(200).json({
      success: true,
      message: "Faculty profile information updated successfully",
      faculty: updatedFaculty,
    });
  } catch (error) {
    console.error("[updateMyFacultyProfile] error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update faculty profile",
    });
  }
};

module.exports = {
  getFacultyProfile,
  getMyStudents,
  getMyTimetable,
  updateMyFacultyProfile,
};

