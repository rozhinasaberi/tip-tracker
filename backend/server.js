const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const tipRoutes = require("./routes/tipRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tips", tipRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Backend running on Render");
});

// ✅ Render PORT (MANDATORY)
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
