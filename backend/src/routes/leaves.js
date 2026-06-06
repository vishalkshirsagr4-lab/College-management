const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { applyLeave, reviewLeave } = require('../controllers/leaveController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('student', 'admin'), applyLeave);
router.put('/:id/review', authMiddleware, authorizeRoles('admin', 'teacher'), reviewLeave);

module.exports = router;
