const User = require("../models/user");
const Faculty = require("../models/faculty");
const bcrypt = require("bcryptjs");
const { deleteFromS3 } = require("../config/s3");

// NOTE: This controller uses multer-s3 (no local disk paths like req.file.path).
// So we must not reference fs.unlinkSync or uploadToS3(req.file.path).


const createFaculty = async (req, res) => {
  try {
    console.log("teachingAssignments:", req.body.teachingAssignments);
    console.log("type:", typeof req.body.teachingAssignments);

    const { name, email, loginID, password, department, designation, phone } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { loginID }] });
    if (existingUser) {
      // multer-s3 does not create local temp files; nothing to unlink.
      return res.status(400).json({ success: false, message: "Faculty already exists" });
    }


    let parsedAssignments = [];
    if (req.body.teachingAssignments) {
      if (typeof req.body.teachingAssignments === "string") {
        try {
          parsedAssignments = JSON.parse(req.body.teachingAssignments);
        } catch (e) {
          return res.status(400).json({ success: false, message: "Invalid teachingAssignments format" });
        }

      } else if (Array.isArray(req.body.teachingAssignments)) {
        parsedAssignments = req.body.teachingAssignments;
      }
    }

    let profileImage = "";
    let profileKey = "";

    // multer-s3 stores metadata directly on req.file
    if (req.file) {
      profileImage = req.file.location || req.file.url || "";
      profileKey = req.file.key || "";
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
    // multer-s3 does not create local temp files; nothing to unlink.
    res.status(500).json({ success: false, message: error.message });
  }

};

// NEW: Core Profile Update Function (Handles Name, Email, Phone, Dept, Designation)
// Endpoint: PUT /api/admin/faculty/details/:facultyId
const updateFacultyDetails = async (req, res) => {
  const controllerName = "updateFacultyDetails";
  try {
    const { facultyId } = req.params;

    // Defensive: ObjectId validation
    if (!facultyId || !String(facultyId).match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid facultyId format. Expected a valid Mongo ObjectId.",
        fieldErrors: [{ field: "facultyId", reason: "Invalid ObjectId" }],
      });
    }

    // Allowed fields only
    const allowedFields = ["name", "email", "phone", "department", "designation"];
    const body = req.body || {};

    // If frontend accidentally sends extra fields, ignore them.
    const unknownFields = Object.keys(body).filter((k) => !allowedFields.includes(k));

    if (unknownFields.length) {
      // Keep it non-fatal but informative.
      console.warn(`[${controllerName}] Ignoring unknown fields:`, unknownFields);
    }

    const { name, email, department, designation, phone } = body;

    // Required field validation (only if present; avoid forcing full update)
    const fieldErrors = [];

    const trimOrNull = (v) => (typeof v === "string" ? v.trim() : v);

    const normalized = {
      name: name !== undefined ? trimOrNull(name) : undefined,
      email: email !== undefined ? trimOrNull(email) : undefined,
      department: department !== undefined ? trimOrNull(department) : undefined,
      designation: designation !== undefined ? trimOrNull(designation) : undefined,
      phone: phone !== undefined ? trimOrNull(phone) : undefined,
    };

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

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty profile not found" });
    }

    // Cross-verify email conflict
    if (normalized.email) {
      const emailConflict = await User.findOne({ email: normalized.email, _id: { $ne: faculty.userID } });
      if (emailConflict) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another user",
          fieldErrors: [{ field: "email", reason: "Email already in use" }],
        });
      }
    }

    // Update linked User fields
    if (faculty.userID) {
      const userUpdateFields = {};
      if (normalized.name !== undefined) userUpdateFields.name = normalized.name;
      if (normalized.email !== undefined) userUpdateFields.email = normalized.email;

      if (Object.keys(userUpdateFields).length > 0) {
        await User.findByIdAndUpdate(faculty.userID, userUpdateFields, { new: true });
      }
    }

    // Update Faculty fields (only present in request)
    if (normalized.department !== undefined) faculty.department = normalized.department;
    if (normalized.designation !== undefined) faculty.designation = normalized.designation;
    if (normalized.phone !== undefined) faculty.phone = normalized.phone;

    // Defensive: if teachingAssignments was mistakenly sent here via FormData as JSON string
    // (not expected by current frontend, but required by prompt for defensive parsing)
    let teachingAssignmentsToApply;
    if (body.teachingAssignments !== undefined) {
      teachingAssignmentsToApply = body.teachingAssignments;
      if (typeof teachingAssignmentsToApply === "string") {
        try {
          teachingAssignmentsToApply = JSON.parse(teachingAssignmentsToApply);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid teachingAssignments JSON string",
            fieldErrors: [{ field: "teachingAssignments", reason: "JSON.parse failed" }],
          });
        }
      }

      if (!Array.isArray(teachingAssignmentsToApply)) {
        return res.status(400).json({
          success: false,
          message: "teachingAssignments must be an array",
          fieldErrors: [{ field: "teachingAssignments", reason: "Expected array" }],
        });
      }

      // Update only teachingAssignments if explicitly provided
      faculty.teachingAssignments = teachingAssignmentsToApply.map((a) => ({
        department: a?.department !== undefined ? String(a.department).trim() : String(faculty.department || "").trim(),
        semester: Number(a?.semester),
        section: a?.section !== undefined ? String(a.section).trim() : String(""),
        subjects: Array.isArray(a?.subjects) ? a.subjects.map((s) => String(s).trim()) : [],
      }));
    }

    await faculty.save();

    const updatedFaculty = await Faculty.findById(facultyId).populate("userID", "name email loginID role");

    res.status(200).json({
      success: true,
      message: "Faculty profile information updated successfully",
      faculty: updatedFaculty,
    });
  } catch (error) {
    // Mongoose validation / cast errors -> return detailed errors
    console.error("[updateFacultyDetails] error:", error);

    const response = {
      success: false,
      message: "Failed to update faculty profile",
    };

    if (error && error.name === "CastError") {
      response.message = "Invalid value format for one of the fields";
      response.fieldErrors = [{ field: error.path, reason: "CastError" }];
      return res.status(400).json(response);
    }

    if (error && error.name === "ValidationError" && error.errors) {
      response.message = "Faculty validation failed";
      response.fieldErrors = Object.values(error.errors).map((e) => ({
        field: e.path,
        reason: e.message,
      }));
      return res.status(400).json(response);
    }

    return res.status(500).json({
      ...response,
      message: error?.message || response.message,
    });
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

    // multer-s3 attaches { location, key } directly on req.file
    const profileImage = req.file.location || req.file.url || "";
    const profileKey = req.file.key || "";

    faculty.profileImage = profileImage;
    faculty.profileKey = faculty.profileKey || profileKey;
    await faculty.save();

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

    if (faculty.profileKey) {
      try {
        await deleteFromS3(faculty.profileKey);
      } catch (s3Err) {
        console.error("S3 asset removal skipped:", s3Err.message);
      }
    } else if (faculty.profileImage) {
      // fallback for old data
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