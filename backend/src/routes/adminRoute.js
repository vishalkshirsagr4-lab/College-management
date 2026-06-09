const express = require("express");
const router = express.Router();
const { createFaculty , updateFacultySemester ,deleteSemester ,getAllFaculty, getFacultyById, updateFacultyProfileImage , deleteFacultyProfileImage, } = require("../controlls/adminfacultyControl");
const { createStudent, updateStudent, deleteStudent , resetPassword ,  getAllStudents , getStudentById , updateStudentProfileImage } = require("../controlls/adminstudentControl");
const { createSubject , updateSubject , deleteSubject , getAllSubjects , getSubjectById , getSubjectsBySemester   } = require("../controlls/adminsubjectControl");
const { createTimetable , updateTimetable , deleteTimetable } = require("../controlls/adminTimecontrol");
const { createExam,getExams,updateExam,deleteExam } = require("../controlls/adminExamControl");
const { getSemesterAttendance } = require("../controlls/attendenceControl");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/faculty",
  authMiddleware,
  upload.single("profileImage"),
  roleMiddleware("admin"),
  createFaculty
);
  
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
  roleMiddleware("admin") ,
  deleteFacultyProfileImage
);


router.post(
  "/student",
  authMiddleware,
  upload.single("profileImage"),
  roleMiddleware("admin"),
  createStudent
);

router.put(
  "/student/:studentId",
  authMiddleware,
  roleMiddleware("admin"),
  updateStudent
);

router.delete(
  "/student/:studentId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteStudent
);

router.post(
  "/subject",
  authMiddleware,
  roleMiddleware("admin"),
  createSubject
);

router.put(
  "/subject/:subjectId",
  authMiddleware,
  roleMiddleware("admin"),
  updateSubject
);

router.delete(
  "/subject/:subjectId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSubject
);

router.put(
  "/reset-password",
  authMiddleware,
  roleMiddleware("admin"),
  resetPassword
);

router.get(
  "/students",
  authMiddleware,
  roleMiddleware("admin"),
  getAllStudents
);

router.get(
  "/students/:studentId",
  authMiddleware,
  roleMiddleware("admin"),
  getStudentById
);

router.get(
  "/faculty",
  authMiddleware,
  roleMiddleware("admin"),
  getAllFaculty
);

router.get(
  "/faculty/:facultyId",
  authMiddleware,
  roleMiddleware("admin"),
  getFacultyById
);

router.get("/subjects", getAllSubjects);

router.get("/subjects/:subjectId", getSubjectById);

router.get(
  "/subjects/semester/:semester",
  getSubjectsBySemester
);

router.post(
  "/timetable",
  authMiddleware,
  roleMiddleware("admin"),
  createTimetable
);

router.put(
  "/timetable/:timetableId",
  authMiddleware,
  roleMiddleware("admin"),
  updateTimetable
);

router.delete(
  "/timetable/:timetableId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteTimetable
);  

router.put(
  "/student/profile-image/:studentId",
  authMiddleware, 
  roleMiddleware("admin"),
  upload.single("profileImage"),
  updateStudentProfileImage
);

router.post(
  "/exam",
  authMiddleware,
  roleMiddleware("admin"),
  createExam
);
  
router.get(
  "/exams",
  authMiddleware,
  roleMiddleware("admin"),
  getExams
);

router.put(
  "/exams/:examId",
  authMiddleware,
  roleMiddleware("admin"),
  updateExam
);

router.delete(
  "/exams/:examId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteExam
);

router.get(
  "/attendance/semester/:semester",
  authMiddleware,
  roleMiddleware("admin"),
  getSemesterAttendance
);

module.exports = router;