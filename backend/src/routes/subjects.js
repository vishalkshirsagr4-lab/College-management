const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin'), createSubject);
router.get('/', authMiddleware, getSubjects);
router.get('/:id', authMiddleware, getSubjectById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateSubject);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteSubject);

module.exports = router;
