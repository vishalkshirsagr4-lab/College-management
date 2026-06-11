const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getFacultyProfile, getMyStudents , getMyTimetable, updateMyFacultyProfile } = require("../controlls/facultyControl");

const { addSubjectToExam , addMarks} = require("../controlls/facultyExamControl");
const { markAttendance } = require("../controlls/attendenceControl");
const roleMiddleware = require("../middleware/roleMiddleware");


router.get("/profile", authMiddleware, getFacultyProfile);
router.put("/profile", authMiddleware, roleMiddleware("faculty"), updateMyFacultyProfile);

router.get("/students", authMiddleware, getMyStudents);
router.get("/timetable", authMiddleware, getMyTimetable);
router.post("/exam/subjects", authMiddleware, addSubjectToExam);
router.post("/exam/marks", authMiddleware, addMarks);

router.post(
  "/attendance/mark",
  authMiddleware,
  roleMiddleware("faculty"),
  markAttendance
);

const { createAssignment } = require("../controlls/facultyAssignmentControl");

router.post(
  "/assignment/create",
  authMiddleware,
  roleMiddleware("faculty"),
  createAssignment
);

module.exports = router;

