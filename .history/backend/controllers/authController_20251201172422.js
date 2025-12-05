// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, hourlyWage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // plain-text password (as requested)
    const user = await User.create({
      name,
      email,
      password,
      hourlyWage: hourlyWage || 0,
    });

    const token = generateToken(user._id);
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      hourlyWage: user.hourlyWage,
    };

    res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // plain text comparison
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      hourlyWage: user.hourlyWage,
    };

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    // req.user is set in authMiddleware
    res.json({ user: req.user });
  } catch (err) {
    console.error('GetMe error:', err.message);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

// PUT /api/auth/update
exports.updateUser = async (req, res) => {
  try {
    const { name, email, hourlyWage, password } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (hourlyWage !== undefined) updateFields.hourlyWage = hourlyWage;
    if (password) updateFields.password = password; // plain text

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json({ updatedUser: updated });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// DELETE /api/auth/delete
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};
