const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// ⭐ FIXED CORS FOR EXPRESS v5 ⭐
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",   // VS Code Live Server
        "http://localhost:5500",
        "http://127.0.0.1:5000",
        "http://localhost:5000"
      ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
app.listen(PORT, () =>
    console.log(`🔥 Backend running on http://127.0.0.1:${PORT}`)
);
