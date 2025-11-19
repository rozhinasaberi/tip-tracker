// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    hourlyWage: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'CAD',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
