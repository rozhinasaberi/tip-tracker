const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

//allowing front end 
app.use(cors({
    origin: "*",   
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
  }));
  

app.use(express.json());

// connect DB
connectDB();

// routes
const authRoutes = require('./routes/authRoutes');
const tipRoutes = require('./routes/tipRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tips', tipRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running");
});



const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});