// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  register,
  login,
  getMe,
  updateProfile,
  deleteAccount,
} = require('../controllers/authController');

// POST /api/auth/signup
router.post('/signup', register);

// POST /api/auth/signin
router.post('/signin', login);

// GET /api/auth/me
router.get('/me', authMiddleware, getMe);

// PUT /api/auth/update
router.put('/update', authMiddleware, updateProfile);

// DELETE /api/auth/delete
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;
