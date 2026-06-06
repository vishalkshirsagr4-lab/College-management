const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { getStudentDashboard } = require('../controllers/studentDashboardController');

const router = express.Router();

router.get('/me/dashboard', authMiddleware, authorizeRoles('student', 'admin'), getStudentDashboard);

module.exports = router;

