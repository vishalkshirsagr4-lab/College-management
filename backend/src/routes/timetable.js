const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { adminOnly, authorizeRoles } = require('../middleware/role');
const { createTimetable, getTimetable, getTodaysClasses } = require('../controllers/timetableController');

const router = express.Router();

router.post('/', authMiddleware, adminOnly, createTimetable);
router.get('/', authMiddleware, getTimetable);
router.get('/today', authMiddleware, getTodaysClasses);

module.exports = router;
