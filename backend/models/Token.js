const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true,
    unique: true
  },

  customerName: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["WAITING", "COMPLETED", "CANCELLED"],
    default: "WAITING"
  },

  // NEW: who cancelled the token
  cancelledBy: {
    type: String,
    enum: ["customer", "manager"],
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Token", tokenSchema);
