const express = require("express");
const router = express.Router();

const { 
  createFaculty, 
  updateFacultySemester, 
  deleteSemester, 
  getAllFaculty, 
  getFacultyById, 
  updateFacultyProfileImage, 
  deleteFacultyProfileImage,
  deleteFaculty,
  updateFacultyDetails
} = require("../controlls/adminfacultyControl");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { upload } = require("../middleware/upload");

// Runtime debugging to verify multer middleware shape.
// Remove/disable these logs after confirming correct behavior.
console.log("[adminRoute] typeof upload:", typeof upload);
console.log("[adminRoute] upload keys (if any):", upload && typeof upload === "function" ? Object.keys(upload) : upload);


// --- FACULTY MANAGEMENT ROUTES ---
router.put("/faculty/profile-image", authMiddleware, roleMiddleware("admin"), upload.single("profileImage"), updateFacultyProfileImage);
router.delete("/faculty/profile-image", authMiddleware, roleMiddleware("admin"), deleteFacultyProfileImage);
router.put("/faculty/subjects", authMiddleware, roleMiddleware("admin"), updateFacultySemester);
router.delete("/faculty/subjects", authMiddleware, roleMiddleware("admin"), deleteSemester);
router.post("/faculty", authMiddleware, upload.single("profileImage"), roleMiddleware("admin"), createFaculty);
router.put("/faculty/:facultyId", authMiddleware, roleMiddleware("admin"), updateFacultySemester);
router.put("/faculty/details/:facultyId", authMiddleware, roleMiddleware("admin"), updateFacultyDetails);
router.get("/faculty/:facultyId", authMiddleware, roleMiddleware("admin"), getFacultyById);
router.get("/faculty", authMiddleware, roleMiddleware("admin"), getAllFaculty);
router.delete("/faculty/:facultyId", authMiddleware, roleMiddleware("admin"), deleteFaculty);

// --- STUDENT PORTAL CONTROLLERS LINKED ---
const { 
  createStudent, 
  updateStudent, 
  deleteStudent, 
  resetPassword, 
  getAllStudents, 
  getStudentById, 
  updateStudentProfileImage 
} = require("../controlls/adminstudentControl");

const { createSubject, updateSubject, deleteSubject, getAllSubjects, getSubjectById, getSubjectsBySemester } = require("../controlls/adminsubjectControl");
const { createTimetable, updateTimetable, deleteTimetable, getAllTimetable } = require("../controlls/adminTimecontrol");
// NOTE: this file will throw a clear error at startup if getAllTimetable is missing.


const { createExam, getExams, updateExam, deleteExam } = require("../controlls/adminExamControl");
const { getSemesterAttendance } = require("../controlls/attendenceControl");

// --- CORE STUDENT PORTAL ENDPOINTS ---
router.post("/student", authMiddleware, upload.single("profileImage"), roleMiddleware("admin"), createStudent);
// Change "/student/:studentId" to "/students/:studentId"
router.put("/student/:studentId", authMiddleware, roleMiddleware("admin"), updateStudent);
router.delete("/student/:studentId", authMiddleware, roleMiddleware("admin"), deleteStudent);
router.get("/students", authMiddleware, roleMiddleware("admin"), getAllStudents);
router.get("/students/:studentId", authMiddleware, roleMiddleware("admin"), getStudentById);
router.put("/student/profile-image/:studentId", authMiddleware, roleMiddleware("admin"), upload.single("profileImage"), updateStudentProfileImage);

// --- REMAINING PORTAL UTILITIES ---
router.post("/subject", authMiddleware, roleMiddleware("admin"), createSubject);
router.put("/subject/:subjectId", authMiddleware, roleMiddleware("admin"), updateSubject);
router.delete("/subject/:subjectId", authMiddleware, roleMiddleware("admin"), deleteSubject);
router.put("/reset-password", authMiddleware, roleMiddleware("admin"), resetPassword);
router.get("/subjects", getAllSubjects);
router.get("/subjects/:subjectId", getSubjectById);
router.get("/subjects/semester/:semester", getSubjectsBySemester);
router.get("/timetable", authMiddleware, roleMiddleware("admin"), getAllTimetable);
router.post("/timetable", authMiddleware, roleMiddleware("admin"), createTimetable);
router.put("/timetable/:timetableId", authMiddleware, roleMiddleware("admin"), updateTimetable);
router.delete("/timetable/:timetableId", authMiddleware, roleMiddleware("admin"), deleteTimetable);  

router.post("/exam", authMiddleware, roleMiddleware("admin"), createExam);
router.get("/exams", authMiddleware, roleMiddleware("admin"), getExams);
router.put("/exams/:examId", authMiddleware, roleMiddleware("admin"), updateExam);
router.delete("/exams/:examId", authMiddleware, roleMiddleware("admin"), deleteExam);
router.get("/attendance/semester/:semester", authMiddleware, roleMiddleware("admin"), getSemesterAttendance);

// Add this import near the other controller imports at the top of your router file
const { 
  sendNotification, 
  getAllNotifications 
} = require("../controlls/notificationControl"); // Ensure path matches your notification controller file exactly

// ... Keep all other existing route definitions exactly the same ...

// --- UTILITY NOTIFICATION MANAGEMENT ENDPOINTS (ADD THIS SECTION) ---
router.post("/notification", authMiddleware, roleMiddleware("admin"), sendNotification);
router.get("/notifications/all", authMiddleware, roleMiddleware("admin"), getAllNotifications);

module.exports = router;