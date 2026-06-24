const mongoose = require("mongoose");
const User = require("../models/user");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const { deleteFromS3 } = require("../config/s3");

// ==========================================
// 1. CREATE STUDENT
// ==========================================
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
  subjects,
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

    let parsedSubjects = [];

if (subjects) {
  try {
    parsedSubjects = JSON.parse(subjects);
  } catch (err) {
    parsedSubjects = [];
  }
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
  subjects: parsedSubjects,
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

// ==========================================
// 2. UPDATE STUDENT (FULLY RESOLVED FOR NAME)
// ==========================================
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const {
      name,
      email,
      loginID,
      rollNo,
      ...studentFields
    } = req.body;

    // Find existing student
    const targetStudent = await Student.findById(studentId);

    if (!targetStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // =====================================
    // UPDATE USER COLLECTION
    // =====================================
    if (targetStudent.userID) {
      const userUpdateFields = {};

      if (name !== undefined) {
        userUpdateFields.name = String(name).trim();
      }

      if (email !== undefined) {
        const processedEmail = String(email)
          .trim()
          .toLowerCase();

        const emailExists = await User.findOne({
          email: processedEmail,
          _id: { $ne: targetStudent.userID },
        });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }

        userUpdateFields.email = processedEmail;
      }

      if (loginID !== undefined) {
        const loginExists = await User.findOne({
          loginID,
          _id: { $ne: targetStudent.userID },
        });

        if (loginExists) {
          return res.status(400).json({
            success: false,
            message: "Login ID already exists",
          });
        }

        userUpdateFields.loginID = loginID;
        studentFields.loginID = loginID;
      }

      if (Object.keys(userUpdateFields).length > 0) {
        const updatedUser = await User.findByIdAndUpdate(
          targetStudent.userID,
          {
            $set: userUpdateFields,
          },
          {
            new: true,
            runValidators: true,
          }
        );

        console.log("UPDATED USER =>", updatedUser);
      }
    }

    // =====================================
    // ROLL NUMBER CHECK
    // =====================================
    if (
      rollNo !== undefined &&
      rollNo !== targetStudent.rollNo
    ) {
      const existingRollNo = await Student.findOne({
        rollNo,
        _id: { $ne: studentId },
      });

      if (existingRollNo) {
        return res.status(400).json({
          success: false,
          message: "Roll Number already exists",
        });
      }

      studentFields.rollNo = rollNo;
    }

    // =====================================
    // CLEAN DATA
    // =====================================
    if (studentFields.department) {
      studentFields.department = String(
        studentFields.department
      )
        .trim()
        .toUpperCase();
    }

    if (studentFields.section) {
      studentFields.section = String(
        studentFields.section
      )
        .trim()
        .toUpperCase();
    }

    if (
      studentFields.semester !== undefined &&
      studentFields.semester !== ""
    ) {
      studentFields.semester = Number(
        studentFields.semester
      );
    }

    // =====================================
    // UPDATE STUDENT COLLECTION
    // =====================================
    await Student.findByIdAndUpdate(
      studentId,
      {
        $set: studentFields,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // =====================================
    // FETCH FRESH UPDATED DATA
    // =====================================
    const updatedStudent = await Student.findById(
      studentId
    ).populate(
      "userID",
      "name email loginID role isActive"
    );

    console.log(
      "UPDATED STUDENT =>",
      JSON.stringify(updatedStudent, null, 2)
    );

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error(
      "UPDATE STUDENT ERROR =>",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// 3. DELETE STUDENT
// ==========================================
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

// ==========================================
// 4. RESET PASSWORD
// ==========================================
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

// ==========================================
// 5. GET ALL STUDENTS
// ==========================================
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

// ==========================================
// 6. GET STUDENT BY ID
// ==========================================
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate("userID", "name email loginID role");

    console.log(
      "GET STUDENT =>",
      JSON.stringify(student, null, 2)
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });

  } catch (error) {
    console.error("GET STUDENT ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 7. UPDATE PROFILE IMAGE
// ==========================================
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

    const previousAsset = student.profileKey || student.profileImage;
    if (previousAsset) {
      try {
        await deleteFromS3(previousAsset);
      } catch (err) {
        console.error("S3 clear warning:", err.message);
      }
    }

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
