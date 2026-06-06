const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const {
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
} = require('../controllers/feeController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin'), createFee);
router.get('/', authMiddleware, getFees);
router.get('/:id', authMiddleware, getFeeById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateFee);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteFee);

module.exports = router;
