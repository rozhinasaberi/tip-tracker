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

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (needs JWT)
router.get('/me', authMiddleware, getMe);

// PUT /api/auth/update  (update hourlyWage only)
router.put('/update', authMiddleware, updateProfile);

// DELETE /api/auth/delete
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;
