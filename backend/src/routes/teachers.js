const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { teacherOnly } = require('../middleware/role');
const { uploadProfileImage, uploadAssignmentFile } = require('../config/awsUpload');
const {
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherSubjects,
  markAttendance,
  uploadMarks,
  getStudentAttendance,
} = require('../controllers/teacherController');

const router = express.Router();

router.use(authMiddleware, teacherOnly);

router.get('/profile', getTeacherProfile);
  router.put('/profile', uploadProfileImage, updateTeacherProfile);
router.get('/subjects', getTeacherSubjects);
router.post('/attendance', markAttendance);
router.post('/marks', uploadMarks);
router.get('/attendance/:studentId', getStudentAttendance);

module.exports = router;
