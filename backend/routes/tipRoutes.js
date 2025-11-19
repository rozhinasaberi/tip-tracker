// routes/tipRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getTips,
  getTipById,
  createTip,
  updateTip,
  deleteTip,
} = require('../controllers/tipController');

// All tip routes require authentication
router.use(authMiddleware);

// GET /api/tips
router.get('/', getTips);

// GET /api/tips/:id
router.get('/:id', getTipById);

// POST /api/tips
router.post('/', createTip);

// PUT /api/tips/:id
router.put('/:id', updateTip);

// DELETE /api/tips/:id
router.delete('/:id', deleteTip);

module.exports = router;
