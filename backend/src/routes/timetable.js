const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { adminOnly, authorizeRoles } = require('../middleware/role');
const { createTimetable, getTimetable, getTodaysClasses, getTimetableById, updateTimetable, deleteTimetable } = require('../controllers/timetableController');

const router = express.Router();

router.post('/', authMiddleware, adminOnly, createTimetable);
router.get('/', authMiddleware, getTimetable);
router.get('/today', authMiddleware, getTodaysClasses);
router.get('/:id', authMiddleware, getTimetableById);
router.put('/:id', authMiddleware, adminOnly, updateTimetable);
router.delete('/:id', authMiddleware, adminOnly, deleteTimetable);

module.exports = router;
