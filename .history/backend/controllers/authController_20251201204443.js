const User = require("../models/User");
const jwt = require("jsonwebtoken");

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

// --------------------- SIGNUP ---------------------
exports.signup = async (req, res) => {
  try {
    const { name, email, password, hourlyWage } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const user = await User.create({ name, email, password, hourlyWage });

    return res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------- SIGNIN ---------------------
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Plain text compare
    if (user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    return res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------- GET LOGGED-IN USER ---------------------
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ user });
};

// --------------------- UPDATE HOURLY WAGE ---------------------
exports.updateUser = async (req, res) => {
  const { hourlyWage } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { hourlyWage },
    { new: true }
  );

  res.json({ user });
};
