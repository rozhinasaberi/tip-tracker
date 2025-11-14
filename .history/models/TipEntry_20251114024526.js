// models/TipEntry.js
const mongoose = require('mongoose');

const tipEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    restaurantName: {
      type: String,
      trim: true,
    },
    hoursWorked: {
      type: Number,
      required: true,
      min: 0,
    },
    tipsAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TipEntry', tipEntrySchema);
