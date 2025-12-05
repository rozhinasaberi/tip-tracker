// controllers/tipController.js
const TipEntry = require('../models/TipEntry');

// GET /api/tips  (optionally ?month=11&year=2025)
exports.getTips = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.user.id };

    if (month && year) {
      const m = parseInt(month, 10) - 1; // JS months are 0-11
      const y = parseInt(year, 10);
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 1);
      query.date = { $gte: start, $lt: end };
    }

    const tips = await TipEntry.find(query).sort({ date: -1 });
    res.json(tips);
  } catch (error) {
    console.error('Get tips error:', error.message);
    res.status(500).json({ message: 'Failed to fetch tips' });
  }
};

// GET /api/tips/:id
exports.getTipById = async (req, res) => {
  try {
    const tip = await TipEntry.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!tip) {
      return res.status(404).json({ message: 'Tip entry not found' });
    }

    res.json(tip);
  } catch (error) {
    console.error('Get tip by id error:', error.message);
    res.status(500).json({ message: 'Failed to fetch tip entry' });
  }
};

// POST /api/tips
exports.createTip = async (req, res) => {
  try {
    const { date, restaurantName, hoursWorked, tipsAmount, notes } = req.body;

    if (!date || hoursWorked == null || tipsAmount == null) {
      return res.status(400).json({
        message: 'Date, hoursWorked and tipsAmount are required',
      });
    }

    const tip = await TipEntry.create({
      userId: req.user.id,
      date,
      restaurantName,
      hoursWorked,
      tipsAmount,
      notes,
    });

    res.status(201).json(tip);
  } catch (error) {
    console.error('Create tip error:', error.message);
    res.status(500).json({ message: 'Failed to create tip entry' });
  }
};

// PUT /api/tips/:id
exports.updateTip = async (req, res) => {
  try {
    const { date, restaurantName, hoursWorked, tipsAmount, notes } = req.body;

    const tip = await TipEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { date, restaurantName, hoursWorked, tipsAmount, notes },
      { new: true }
    );

    if (!tip) {
      return res.status(404).json({ message: 'Tip entry not found' });
    }

    res.json(tip);
  } catch (error) {
    console.error('Update tip error:', error.message);
    res.status(500).json({ message: 'Failed to update tip entry' });
  }
};

// DELETE /api/tips/:id
exports.deleteTip = async (req, res) => {
  try {
    const tip = await TipEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!tip) {
      return res.status(404).json({ message: 'Tip entry not found' });
    }

    res.json({ message: 'Tip entry deleted' });
  } catch (error) {
    console.error('Delete tip error:', error.message);
    res.status(500).json({ message: 'Failed to delete tip entry' });
  }
};
