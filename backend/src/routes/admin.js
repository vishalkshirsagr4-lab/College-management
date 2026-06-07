const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');
const {
  createTeacher,
  createSubject,
  assignTeacherToSubject,
  convertUserToTeacher,
  searchUsers,
  getAllStudents,
  getAllTeachers,
  getAllSubjects,
  getAllUsers,
  blockUser,
  updateTeacherById,
  // new endpoints
  globalSearch,
  getDashboardStats,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware, adminOnly);

router.post('/create-teacher', createTeacher);
router.post('/convert-to-teacher', convertUserToTeacher);
router.get('/users', getAllUsers);
router.get('/users/search', searchUsers);
router.post('/create-subject', createSubject);
router.put('/assign-teacher', assignTeacherToSubject);
router.put('/teachers/:teacherId', updateTeacherById);
router.get('/students', getAllStudents);
router.get('/teachers', getAllTeachers);
router.get('/subjects', getAllSubjects);
router.get('/search', globalSearch);
router.get('/dashboard-stats', getDashboardStats);
router.put('/block-user/:userId', blockUser);
module.exports = router;
