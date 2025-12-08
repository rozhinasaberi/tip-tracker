const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "supersecretjwttiptracker", {
    expiresIn: "30d",
  });
};

//register

exports.register = async (req, res) => {
  try {
    const { name, email, password, hourlyWage } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({
      name,
      email,
      password,
      hourlyWage,
    });

    const token = createToken(user._id);

    res.json({ token, user });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//login

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(user._id);

    res.json({ token, user });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// get logged-in user

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


//update user profile 

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.hourlyWage = req.body.hourlyWage ?? user.hourlyWage;

    // Update password 
    if (req.body.password && req.body.password.trim() !== "") {
      user.password = req.body.password;
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hourlyWage: user.hourlyWage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//delete account 

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};
