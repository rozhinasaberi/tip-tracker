const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// 🔥 FIX CORS PROPERLY
app.use(cors({
  origin: ["http://localhost:5000", "http://127.0.0.1:4000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Connect DB
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const tipRoutes = require('./routes/tipRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tips', tipRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
