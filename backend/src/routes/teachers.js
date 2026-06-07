const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { teacherOnly } = require('../middleware/role');
const { uploadProfileImage, uploadAssignmentFile } = require('../config/awsUpload');
const {
  getTeacherProfile,
  getMyProfile,
  updateTeacherProfile,
  updateMyProfile,
  getTeacherSubjects,
  markAttendance,
  uploadMarks,
  getStudentAttendance,
} = require('../controllers/teacherController');
const { getTeacherTimetable } = require('../controllers/timetableController');
const { getAllStudents } = require('../controllers/studentController');
const { takeAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.use(authMiddleware, teacherOnly);

router.get('/profile', getTeacherProfile);
router.put('/profile', uploadProfileImage, updateTeacherProfile);
router.get('/me', getMyProfile);
router.put('/me', uploadProfileImage, updateMyProfile);
router.get('/subjects', getTeacherSubjects);
router.get('/timetable', getTeacherTimetable);
router.get('/class-students', getAllStudents);
router.post('/attendance', markAttendance);
router.post('/attendance/mark', takeAttendance);
router.post('/marks', uploadMarks);
router.get('/attendance/:studentId', getStudentAttendance);

module.exports = router;
