// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getMe,
  updateUser,
  deleteUser,
} = require('../controllers/authController');
router.put("/update", authMiddleware, authController.updateProfile);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put("/update", protect, updateProfile);

router.get('/me', authMiddleware, getMe);
router.put('/update', authMiddleware, updateUser);
router.delete('/delete', authMiddleware, deleteUser);

module.exports = router;
