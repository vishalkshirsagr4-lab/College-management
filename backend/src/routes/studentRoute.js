const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getStudentTimetable , getStudentProfile , getAllExams , getExamDetails , getExamResult } = require("../controlls/studentControl");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getMyAttendance } = require("../controlls/attendenceControl");

router.get("/timetable", authMiddleware, getStudentTimetable);
router.get("/profile", authMiddleware, getStudentProfile);
router.get("/exams", authMiddleware, getAllExams);
router.get("/exams/:examId", authMiddleware, getExamDetails);
router.get("/exams/:examId/result", authMiddleware, getExamResult);

router.get(
  "/attendance/my",
  authMiddleware,
  roleMiddleware("student"),
  getMyAttendance
);

const { getMyAssignments } = require("../controlls/studentAssignmentControl");

router.get(
  "/assignment/my",
  authMiddleware,
  roleMiddleware("student"),
  getMyAssignments
);

module.exports = router;

