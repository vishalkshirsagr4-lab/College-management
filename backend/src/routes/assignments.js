const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin'), upload.single('file'), createAssignment);
router.get('/', authMiddleware, getAssignments);
router.get('/:id', authMiddleware, getAssignmentById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), upload.single('file'), updateAssignment);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteAssignment);

module.exports = router;
