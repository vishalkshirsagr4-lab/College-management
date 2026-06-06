const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const {
  createResult,
  getResults,
  getResultById,
  updateResult,
  deleteResult,
} = require('../controllers/resultController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin'), createResult);
router.get('/', authMiddleware, getResults);
router.get('/:id', authMiddleware, getResultById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateResult);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteResult);

module.exports = router;
