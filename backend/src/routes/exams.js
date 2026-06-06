const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
} = require('../controllers/examController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin'), createExam);
router.get('/', authMiddleware, getExams);
router.get('/:id', authMiddleware, getExamById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateExam);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteExam);

module.exports = router;
