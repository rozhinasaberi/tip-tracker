// controllers/tipController.js
const TipEntry = require('../models/TipEntry');

// GET /api/tips
exports.getTips = async (req, res) => {
  try {
    const tips = await TipEntry.find({ user: req.userId }).sort({ date: -1 });
    res.json(tips);
  } catch (err) {
    console.error('Get tips error:', err.message);
    res.status(500).json({ message: 'Failed to fetch tips' });
  }
};

// GET /api/tips/:id
exports.getTipById = async (req, res) => {
  try {
    const tip = await TipEntry.findOne({ _id: req.params.id, user: req.userId });
    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }
    res.json(tip);
  } catch (err) {
    console.error('Get tip error:', err.message);
    res.status(500).json({ message: 'Failed to fetch tip entry' });
  }
};

// POST /api/tips
exports.createTip = async (req, res) => {
  try {
    const { date, restaurantName, hoursWorked, tipsAmount, notes } = req.body;

    const tip = await TipEntry.create({
      user: req.userId,
      date,
      restaurantName,
      hoursWorked,
      tipsAmount,
      notes,
    });

    res.status(201).json(tip);
  } catch (err) {
    console.error('Create tip error:', err.message);
    res.status(500).json({ message: 'Failed to create tip entry' });
  }
};

// PUT /api/tips/:id
exports.updateTip = async (req, res) => {
  try {
    const { date, restaurantName, hoursWorked, tipsAmount, notes } = req.body;

    const tip = await TipEntry.findOneAndUpdate(
      { _id: req.params.id,  user: req.userId},
      { $set: { date, restaurantName, hoursWorked, tipsAmount, notes } },
      { new: true }
    );

    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    res.json(tip);
  } catch (err) {
    console.error('Update tip error:', err.message);
    res.status(500).json({ message: 'Failed to update tip entry' });
  }
};

// DELETE /api/tips/:id
exports.deleteTip = async (req, res) => {
  try {
    const tip = await TipEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    res.json({ message: 'Tip deleted' });
  } catch (err) {
    console.error('Delete tip error:', err.message);
    res.status(500).json({ message: 'Failed to delete tip entry' });
  }
};
