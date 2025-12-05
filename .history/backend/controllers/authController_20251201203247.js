// controllers/authController.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * REGISTER (no hashing, plain-text password as you requested)
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, hourlyWage, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }

    // Create user (password stored as plain text for this assignment)
    const user = await User.create({
      name,
      email,
      password,
      hourlyWage: hourlyWage || 0,
      currency: currency || 'CAD',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hourlyWage: user.hourlyWage,
        currency: user.currency,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * LOGIN
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Plain-text password check (per your requirement)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hourlyWage: user.hourlyWage,
        currency: user.currency,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * GET CURRENT USER
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('getMe error:', err.message);
    res.status(500).json({ message: 'Server error getting user profile' });
  }
};

/**
 * UPDATE PROFILE — ONLY HOURLY WAGE
 * PUT /api/auth/update
 */
exports.updateProfile = async (req, res) => {
  try {
    const { hourlyWage } = req.body;

    // Only update hourlyWage (no name/email changes)
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (hourlyWage !== undefined) {
      user.hourlyWage = hourlyWage;
    }

    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hourlyWage: user.hourlyWage,
        currency: user.currency,
      },
    });
  } catch (err) {
    console.error('updateProfile error:', err.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

/**
 * DELETE ACCOUNT
 * DELETE /api/auth/delete
 */
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('deleteAccount error:', err.message);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};
