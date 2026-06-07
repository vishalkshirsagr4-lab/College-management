const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  createStudentProfile,
  getAllStudents,
  getMyStudentProfile,
  getMyProfile,
  getStudentById,
  updateStudentProfile,
  updateMyProfile,
  updateStudentSubjects,
  deleteStudentProfile,
} = require('../controllers/studentController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin', 'student'), upload.single('photo'), createStudentProfile);
router.get('/', authMiddleware, authorizeRoles('admin', 'teacher'), getAllStudents);
router.get('/me', authMiddleware, authorizeRoles('student', 'admin'), getMyStudentProfile);
router.get('/profile/me', authMiddleware, authorizeRoles('student'), getMyProfile);
router.put('/profile/me', authMiddleware, authorizeRoles('student'), upload.single('photo'), updateMyProfile);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getStudentById);
router.put('/:id', authMiddleware, authorizeRoles('admin', 'student'), upload.single('photo'), updateStudentProfile);
router.put('/:id/subjects', authMiddleware, authorizeRoles('admin', 'student'), updateStudentSubjects);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteStudentProfile);

// Student-facing helpers (also exposed under /api/students/...)
const {
  getStudentDashboard,
  getStudentTeachers,
  getStudentSubjects,
  getStudentAssignments,
  getStudentMaterials,
  getStudentAttendance,
  getStudentNotices,
  getStudentExams,
  getStudentResults,
} = require('../controllers/studentDashboardController');

router.get('/me/dashboard', authMiddleware, authorizeRoles('student'), getStudentDashboard);
router.get('/me/teachers', authMiddleware, authorizeRoles('student'), getStudentTeachers);
router.get('/me/subjects', authMiddleware, authorizeRoles('student'), getStudentSubjects);
router.get('/me/assignments', authMiddleware, authorizeRoles('student'), getStudentAssignments);
router.get('/me/materials', authMiddleware, authorizeRoles('student'), getStudentMaterials);
router.get('/me/attendance', authMiddleware, authorizeRoles('student'), getStudentAttendance);
router.get('/me/notices', authMiddleware, authorizeRoles('student'), getStudentNotices);
router.get('/me/exams', authMiddleware, authorizeRoles('student'), getStudentExams);
router.get('/me/results', authMiddleware, authorizeRoles('student'), getStudentResults);

module.exports = router;
