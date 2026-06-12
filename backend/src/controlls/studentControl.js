const Exam = require("../models/Adminexam");
const ExamSubject = require("../models/facultyexam");
const Student = require("../models/student");
const Marks = require("../models/marks");
const Timetable = require("../models/timetable");

const getAllExams = async (req, res) => {
  try {
    // FIX: Changed "name" to "examName" to perfectly match your Mongoose Schema
    const exams = await Exam.find()
      .select("examName examDate semester department status")
      .sort({ examDate: 1 });

    res.json({
      success: true,
      data: exams,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const subjects = await ExamSubject.find({ examId }).populate(
      "facultyId",
      "department designation"
    );

    res.json({
      success: true,
      data: {
        examName: exam.examName,
        department: exam.department,
        semester: exam.semester,
        examDate: exam.examDate,
        status: exam.status,
        exam,
        subjects,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getExamResult = async (req, res) => {
  try {
    const { examId } = req.params;

    const student = await Student.findOne({
      userID: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const marks = await Marks.find({
      examId,
      studentId: student._id,
    });

    if (!marks.length) {
      return res.status(404).json({
        success: false,
        message: "Result not published yet",
      });
    }

    let totalObtained = 0;
    let totalMax = 0;

    const subjectWise = marks.map((m) => {
      totalObtained += m.marksObtained;
      totalMax += m.totalMarks;

      return {
        subject: m.subject,
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
      };
    });

    const percentage = (totalObtained / totalMax) * 100;

    const resultStatus = percentage >= 35 ? "PASS" : "FAIL";

    res.json({
      success: true,
      data: {
        examId,
        student: student._id,
        subjectWise,
        totalObtained,
        totalMax,
        percentage: percentage.toFixed(2),
        resultStatus,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      userID: req.user.id,
    }).populate("userID", "name email loginID role");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const profile = {
      studentId: student._id,
      name: student.userID.name,
      email: student.userID.email,
      loginID: student.userID.loginID,
      role: student.userID.role,

      rollNo: student.rollNo,
      department: student.department,
      semester: student.semester,
      section: student.section,

      subjects: student.subjects,
      phone: student.phone,
      address: student.address,

      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      bloodGroup: student.bloodGroup,

      admissionYear: student.admissionYear,
      academicYear: student.academicYear,

      parentName: student.parentName,
      parentPhone: student.parentPhone,
      guardianEmail: student.guardianEmail,

      attendancePercentage: student.attendancePercentage,
      cgpa: student.cgpa,
      feeStatus: student.feeStatus,

      profileImage: student.profileImage,
      isActive: student.isActive,

      createdAt: student.createdAt,
    };

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStudentTimetable = async (req, res) => {
  try {
    const student = await Student.findOne({
      userID: req.user.id,
    });
    console.log("REQ USER:", req.user);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    const timetable = await Timetable.find({
      department: student.department,
      semester: student.semester,
      section: student.section,
    }).populate("facultyId", "department designation");

    // Optional grouping by day
    const grouped = timetable.reduce((acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = [];
      }

      acc[item.day].push(item);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getStudentTimetable , getStudentProfile , getAllExams , getExamDetails , getExamResult };