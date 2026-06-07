const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { getStudentDashboard, getStudentTeachers, getStudentSubjects, getStudentAssignments, getStudentMaterials, getStudentAttendance, getStudentNotices, getStudentExams, getStudentResults } = require('../controllers/studentDashboardController');

const router = express.Router();

router.get('/me/dashboard', authMiddleware, authorizeRoles('student', 'admin'), getStudentDashboard);
router.get('/me/teachers', authMiddleware, authorizeRoles('student'), getStudentTeachers);
router.get('/me/subjects', authMiddleware, authorizeRoles('student'), getStudentSubjects);
router.get('/me/assignments', authMiddleware, authorizeRoles('student'), getStudentAssignments);
router.get('/me/materials', authMiddleware, authorizeRoles('student'), getStudentMaterials);
router.get('/me/attendance', authMiddleware, authorizeRoles('student'), getStudentAttendance);
router.get('/me/notices', authMiddleware, authorizeRoles('student'), getStudentNotices);
router.get('/me/exams', authMiddleware, authorizeRoles('student'), getStudentExams);
router.get('/me/results', authMiddleware, authorizeRoles('student'), getStudentResults);

module.exports = router;

