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

router.use(authMiddleware);

router.get('/', getTips);
router.post('/', createTip);
router.get('/:id', getTipById);
router.put('/:id', updateTip);
router.delete('/:id', deleteTip);

module.exports = router;
