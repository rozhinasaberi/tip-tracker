const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

module.exports = {
  /********************************************
   * REGISTER (NO HASHING)
   ********************************************/
  register: async (req, res) => {
    try {
      const { name, email, password, hourlyWage } = req.body;

      // Check if email exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await User.create({
        name,
        email,
        password,   // stored in plain text (your request)
        hourlyWage,
      });

      const token = generateToken(user._id);

      res.json({ message: "Registered", token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Registration failed" });
    }
  },

  /********************************************
   * LOGIN (NO HASHING)
   ********************************************/
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });

      if (user.password !== password) {
        return res.status(400).json({ message: "Incorrect password" });
      }

      const token = generateToken(user._id);

      res.json({
        message: "Logged in",
        token,
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Login failed" });
    }
  },

  /********************************************
   * GET LOGGED-IN USER
   ********************************************/
  me: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load user info" });
    }
  },

  /********************************************
   * DELETE ACCOUNT
   ********************************************/
  deleteAccount: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user.id);
      res.json({ message: "Account deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Delete failed" });
    }
  },

  /********************************************
   * UPDATE PROFILE (NO HASHING)
   ********************************************/
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email, hourlyWage, password } = req.body;

      const update = {
        name,
        email,
        hourlyWage,
      };

      // If they entered a new password, update it (PLAIN TEXT)
      if (password) {
        update.password = password;
      }

      const user = await User.findByIdAndUpdate(userId, update, {
        new: true,
      });

      res.json({ message: "Profile updated", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update failed" });
    }
  },
};

// PUT /api/auth/update  (ONLY updates hourlyWage)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hourlyWage } = req.body;

    if (!hourlyWage && hourlyWage !== 0) {
      return res.status(400).json({ message: "Hourly wage is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { hourlyWage },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};
