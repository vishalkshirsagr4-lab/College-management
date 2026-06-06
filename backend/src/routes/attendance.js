const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const {
  createAttendance,
  getAttendance,
  getAttendanceByStudent,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin'), createAttendance);
router.get('/', authMiddleware, getAttendance);
router.get('/student/:studentId', authMiddleware, getAttendanceByStudent);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateAttendance);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteAttendance);

module.exports = router;
