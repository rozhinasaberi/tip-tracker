const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// ----------------------------
// 🔥 GLOBAL CORS FIX (handles preflight correctly)
// ----------------------------
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:4000", "http://127.0.0.1:4000"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Body parser
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tips', require('./routes/tipRoutes'));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ----------------------------
// Start Server
// ----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
