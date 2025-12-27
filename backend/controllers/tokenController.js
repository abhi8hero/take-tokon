const Token = require("../models/Token");

/**
 * ============================
 * CREATE TOKEN (Customer)
 * ============================
 */
exports.createToken = async (req, res) => {
  try {
    const { customerName } = req.body;

    if (!customerName) {
      return res.status(400).json({ message: "customerName is required" });
    }

    const lastToken = await Token.findOne().sort({ tokenNumber: -1 });
    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const token = await Token.create({
      tokenNumber: nextTokenNumber,
      customerName,
      status: "WAITING"
    });

    res.json(token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 * GET CURRENT TOKEN (Now Serving)
 * ============================
 */
exports.getCurrentToken = async (req, res) => {
  try {
    const token = await Token.findOne({ status: "WAITING" })
      .sort({ tokenNumber: 1 });

    res.json(token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 * GET FULL QUEUE (Manager View)
 * ============================
 */
exports.getQueue = async (req, res) => {
  try {
    const tokens = await Token.find({
      status: { $in: ["WAITING"] }
    }).sort({ tokenNumber: 1 });

    res.json(tokens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 * GET TOKEN BY NUMBER (Customer Auto Refresh)
 * ============================
 */
exports.getTokenByNumber = async (req, res) => {
  try {
    const token = await Token.findOne({
      tokenNumber: req.params.tokenNumber
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    res.json(token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 * COMPLETE TOKEN (Manager)
 * ============================
 */
exports.completeToken = async (req, res) => {
  try {
    const { tokenNumber } = req.params;

    const token = await Token.findOne({ tokenNumber });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    token.status = "COMPLETED";
    await token.save();

    res.json({ message: `Token ${tokenNumber} completed` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 * COMPLETE CURRENT & MOVE NEXT
 * ============================
 */
exports.nextToken = async (req, res) => {
  try {
    const current = await Token.findOne({ status: "WAITING" })
      .sort({ tokenNumber: 1 });

    if (!current) {
      return res.json({ message: "No tokens in queue" });
    }

    current.status = "COMPLETED";
    await current.save();

    const next = await Token.findOne({ status: "WAITING" })
      .sort({ tokenNumber: 1 });

    res.json({
      message: `Token ${current.tokenNumber} completed`,
      nextToken: next || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 * CANCEL TOKEN (Customer / Manager)
 * ============================
 */
exports.cancelToken = async (req, res) => {
  try {
    const { tokenNumber } = req.params;
    const { by } = req.body; // "customer" | "manager"

    const token = await Token.findOne({
      tokenNumber,
      status: "WAITING"
    });

    if (!token) {
      return res
        .status(404)
        .json({ message: "Token not found or already processed" });
    }

    token.status = "CANCELLED";
    token.canceledBy = by || "customer";
    await token.save();

    res.json({
      message:
        token.canceledBy === "manager"
          ? "Token cancelled by manager"
          : "Token cancelled successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
