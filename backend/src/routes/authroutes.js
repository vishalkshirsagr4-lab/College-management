const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  register,
  verifyRegister,
  login,
  verifyLogin,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getProfile,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-register', verifyRegister);
router.post('/login', login);
router.post('/verify-login', verifyLogin);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getProfile);

module.exports = router