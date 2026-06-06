const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');
const { createHoliday, getHolidays } = require('../controllers/holidayController');

const router = express.Router();

router.post('/', authMiddleware, adminOnly, createHoliday);
router.get('/', authMiddleware, getHolidays);

module.exports = router;
