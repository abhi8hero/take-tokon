const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema({
  currentToken: Number,
  avgTime: Number
});

module.exports = mongoose.model("System", systemSchema);
