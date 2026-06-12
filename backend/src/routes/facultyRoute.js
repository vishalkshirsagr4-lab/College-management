const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getFacultyProfile,
  getMyStudents,
  getMyTimetable,
  updateMyFacultyProfile,
} = require("../controlls/facultyControl");

// FIXED: Included getAllExams here
const {
  addSubjectToExam, 
  addMarks, 
  getMySubjects, 
  getStudentsForGrading,
  getAllExams
} = require("../controlls/facultyExamControl");

const {
  markAttendance,
} = require("../controlls/attendenceControl");

const {
  createAssignment,
} = require("../controlls/facultyAssignmentControl");

const {
  assignmentFileUpload,
} = require("../middleware/upload");

// Profile & Schedules
router.get("/profile", authMiddleware, getFacultyProfile);
router.put("/profile", authMiddleware, roleMiddleware("faculty"), updateMyFacultyProfile);
router.get("/students", authMiddleware, getMyStudents);
router.get("/timetable", authMiddleware, getMyTimetable);

// FIXED: Added root exam retrieval route for component mounting state load
router.get("/exams", authMiddleware, roleMiddleware("faculty"), getAllExams);

// Form Actions and Filtering Hooks
router.post("/exam/subjects", authMiddleware, addSubjectToExam);
router.post("/exam/marks", authMiddleware, addMarks);
router.get("/exam/my-subjects", authMiddleware, roleMiddleware("faculty"), getMySubjects);
router.get("/exam/students-for-grading", authMiddleware, roleMiddleware("faculty"), getStudentsForGrading);

// Attendance & Assignments
router.post("/attendance/mark", authMiddleware, roleMiddleware("faculty"), markAttendance);
router.post("/assignment/create", authMiddleware, roleMiddleware("faculty"), assignmentFileUpload.single("file"), createAssignment);

module.exports = router;