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
  updateFacultyDetails // <-- Added full update controller assignment
} = require("../controlls/adminfacultyControl");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

// --- FACULTY MANAGEMENT ROUTES ---
router.put(
  "/faculty/profile-image",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("profileImage"),
  updateFacultyProfileImage
);

router.delete(
  "/faculty/profile-image",
  authMiddleware,
  roleMiddleware("admin"),
  deleteFacultyProfileImage
);

// 2. Atomic Semester Update & Delete Routes NEXT
router.put(
  "/faculty/subjects",
  authMiddleware,
  roleMiddleware("admin"),
  updateFacultySemester
);

router.delete(
  "/faculty/subjects",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSemester
);

// 3. Dynamic Creation Route
router.post(
  "/faculty",
  authMiddleware,
  upload.single("profileImage"),
  roleMiddleware("admin"),
  createFaculty
);

// 4. Dynamic Parameter URL Routes MUST BE LAST (:facultyId)
router.put(
  "/faculty/:facultyId",
  authMiddleware,
  roleMiddleware("admin"),
  updateFacultySemester
);

router.get(
  "/faculty/:facultyId",
  authMiddleware,
  roleMiddleware("admin"),
  getFacultyById
);

router.get(
  "/faculty",
  authMiddleware,
  roleMiddleware("admin"),
  getAllFaculty
);

router.delete(
  "/faculty/:facultyId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteFaculty // Your controller function for deleting faculty
);

// --- OTHER EXISTING PORTAL ROUTES ---
const { createStudent, updateStudent, deleteStudent, resetPassword, getAllStudents, getStudentById, updateStudentProfileImage } = require("../controlls/adminstudentControl");
const { createSubject, updateSubject, deleteSubject, getAllSubjects, getSubjectById, getSubjectsBySemester } = require("../controlls/adminsubjectControl");
const { createTimetable, updateTimetable, deleteTimetable } = require("../controlls/adminTimecontrol");
const { createExam, getExams, updateExam, deleteExam } = require("../controlls/adminExamControl");
const { getSemesterAttendance } = require("../controlls/attendenceControl");

router.post("/student", authMiddleware, upload.single("profileImage"), roleMiddleware("admin"), createStudent);
router.put("/student/:studentId", authMiddleware, roleMiddleware("admin"), updateStudent);
router.delete("/student/:studentId", authMiddleware, roleMiddleware("admin"), deleteStudent);
router.post("/subject", authMiddleware, roleMiddleware("admin"), createSubject);
router.put("/subject/:subjectId", authMiddleware, roleMiddleware("admin"), updateSubject);
router.delete("/subject/:subjectId", authMiddleware, roleMiddleware("admin"), deleteSubject);
router.put("/reset-password", authMiddleware, roleMiddleware("admin"), resetPassword);
router.get("/students", authMiddleware, roleMiddleware("admin"), getAllStudents);
router.get("/students/:studentId", authMiddleware, roleMiddleware("admin"), getStudentById);
router.get("/subjects", getAllSubjects);
router.get("/subjects/:subjectId", getSubjectById);
router.get("/subjects/semester/:semester", getSubjectsBySemester);
router.post("/timetable", authMiddleware, roleMiddleware("admin"), createTimetable);
router.put("/timetable/:timetableId", authMiddleware, roleMiddleware("admin"), updateTimetable);
router.delete("/timetable/:timetableId", authMiddleware, roleMiddleware("admin"), deleteTimetable);  
router.put("/student/profile-image/:studentId", authMiddleware, roleMiddleware("admin"), upload.single("profileImage"), updateStudentProfileImage);
router.post("/exam", authMiddleware, roleMiddleware("admin"), createExam);
router.get("/exams", authMiddleware, roleMiddleware("admin"), getExams);
router.put("/exams/:examId", authMiddleware, roleMiddleware("admin"), updateExam);
router.delete("/exams/:examId", authMiddleware, roleMiddleware("admin"), deleteExam);
router.get("/attendance/semester/:semester", authMiddleware, roleMiddleware("admin"), getSemesterAttendance);

module.exports = router;