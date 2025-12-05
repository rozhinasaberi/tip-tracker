const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// =========================
// REGISTER
// =========================
exports.register = async (req, res) => {
  try {
    const { name, email, password, hourlyWage } = req.body;

    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password, // (no hashing as requested)
      hourlyWage,
    });

    const token = generateToken(user._id);

    res.json({
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Registration error" });
  }
};

// =========================
// LOGIN
// =========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
};

// =========================
// AUTH / ME (GET LOGGED USER)
// =========================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to load user" });
  }
};

// =========================
// UPDATE USER (ONLY WAGE)
// =========================
exports.updateUser = async (req, res) => {
  try {
    const { hourlyWage } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { hourlyWage },
      { new: true } // IMPORTANT → returns updated object
    );

    if (!updated)
      return res.status(404).json({ message: "User not found" });

    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// =========================
// DELETE ACCOUNT
// =========================
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
