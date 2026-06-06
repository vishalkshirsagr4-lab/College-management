const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  createStudentProfile,
  getAllStudents,
  getMyStudentProfile,
  getStudentById,
  updateStudentProfile,
  deleteStudentProfile,
} = require('../controllers/studentController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin', 'student'), upload.single('photo'), createStudentProfile);
router.get('/', authMiddleware, authorizeRoles('admin'), getAllStudents);
router.get('/me', authMiddleware, authorizeRoles('student', 'admin'), getMyStudentProfile);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getStudentById);
router.put('/:id', authMiddleware, authorizeRoles('admin', 'student'), upload.single('photo'), updateStudentProfile);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteStudentProfile);

module.exports = router;
