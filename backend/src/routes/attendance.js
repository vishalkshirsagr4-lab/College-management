const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const {
  takeAttendance,
  getAttendance,
  getAttendanceByStudent,
  updateAttendance,
  deleteAttendance,
  getStudentStats,
} = require('../controllers/attendanceController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('teacher', 'admin'), takeAttendance);
router.get('/', authMiddleware, authorizeRoles('teacher', 'admin'), getAttendance);
router.get('/student/:studentId', authMiddleware, getAttendanceByStudent);
router.get('/student/:studentId/stats', authMiddleware, getStudentStats);
router.put('/:id', authMiddleware, authorizeRoles('teacher', 'admin'), updateAttendance);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteAttendance);

module.exports = router;
