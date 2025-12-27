require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// --- API Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tokens", require("./routes/tokenRoutes"));
app.use("/api/system", require("./routes/systemRoutes"));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// --- Explicit routes for HTML pages ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/customer", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/customer.html"));
});

app.get("/manager", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/manager.html"));
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
