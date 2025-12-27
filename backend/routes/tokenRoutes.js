const express = require("express");
const router = express.Router();
const Token = require("../models/Token");

// ------------------------------
// Create new token
// ------------------------------
router.post("/create", async (req, res) => {
  try {
    const { customerName } = req.body;

    if (!customerName) {
      return res.status(400).json({ message: "customerName is required" });
    }

    // Get last token
    const latestToken = await Token.findOne({}).sort({ tokenNumber: -1 });
    const nextTokenNumber = latestToken ? latestToken.tokenNumber + 1 : 1;

    const newToken = await Token.create({
      tokenNumber: nextTokenNumber,
      customerName,
      status: "WAITING"
    });

    res.json(newToken);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Get current token status (for customer view)
// ------------------------------
router.get("/status", async (req, res) => {
  try {
    const currentToken = await Token.findOne({ status: "WAITING" }).sort({ tokenNumber: 1 });
    res.json(currentToken);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Get token status by token number (for customer auto-refresh)
// ------------------------------
router.get("/status/:tokenNumber", async (req, res) => {
  try {
    const token = await Token.findOne({ tokenNumber: req.params.tokenNumber });
    if (!token) return res.status(404).json({ message: "Token not found" });
    res.json(token);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Manager marks specific token as completed
// ------------------------------
router.post("/complete/:tokenNumber", async (req, res) => {
  try {
    const { tokenNumber } = req.params;

    const token = await Token.findOne({ tokenNumber: tokenNumber });
    if (!token) return res.status(404).json({ message: "Token not found" });

    await Token.findByIdAndUpdate(token._id, { status: "COMPLETED" });

    res.json({ message: `Token ${tokenNumber} completed` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Manager completes current token and moves to next
// ------------------------------
router.post("/next", async (req, res) => {
  try {
    const currentToken = await Token.findOne({ status: "WAITING" }).sort({ tokenNumber: 1 });
    if (!currentToken) {
      return res.json({ message: "No tokens in queue" });
    }

    await Token.findByIdAndUpdate(currentToken._id, { status: "COMPLETED" });

    const nextToken = await Token.findOne({ status: "WAITING" }).sort({ tokenNumber: 1 });

    res.json({
      message: `Token ${currentToken.tokenNumber} completed`,
      nextToken: nextToken || null
    });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Cancel token (by customer)
// ------------------------------
router.post("/cancel/:tokenNumber", async (req, res) => {
  try {
    const token = await Token.findOne({
      tokenNumber: req.params.tokenNumber,
      status: "WAITING"
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found or already processed" });
    }

    token.status = "CANCELLED";
    token.cancelledBy = "customer"; // <-- mark cancelled by customer
    await token.save();

    res.json({ message: "Token cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Get full queue (manager view)
// ------------------------------
router.get("/queue", async (req, res) => {
  try {
    const tokens = await Token.find({ status: "WAITING" }).sort({ tokenNumber: 1 });
    res.json(tokens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Manager cancels any token
// ------------------------------
router.post("/manager-cancel/:tokenNumber", async (req, res) => {
  try {
    const token = await Token.findOne({
      tokenNumber: req.params.tokenNumber,
      status: "WAITING"
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found or already processed" });
    }

    token.status = "CANCELLED";
    token.cancelledBy = "manager"; // <-- mark cancelled by manager
    await token.save();

    res.json({ message: `Token ${token.tokenNumber} cancelled by manager` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
