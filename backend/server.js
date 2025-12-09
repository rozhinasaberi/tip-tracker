const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

const app = express();

// ✅ CORS (safe for Render + frontend)
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// ✅ Body parser
app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const tipRoutes = require("./routes/tipRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tips", tipRoutes);

// ✅ Health check (important)
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ✅ PORT — MUST come from Render
const PORT = process.env.PORT;

if (!PORT) {
  console.error("❌ PORT environment variable not set");
  process.exit(1);
}

// ✅ Start server (Render-compatible)
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
