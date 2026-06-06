const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('admin'), upload.single('attachment'), createNotice);
router.get('/', authMiddleware, getNotices);
router.get('/:id', authMiddleware, getNoticeById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), upload.single('attachment'), updateNotice);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteNotice);

module.exports = router;
