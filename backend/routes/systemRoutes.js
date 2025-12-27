const express = require("express");
const System = require("../models/System");
const router = express.Router();

// Get system status
router.get("/", async (req, res) => {
  let system = await System.findOne();

  // Create system if not exists (first run)
  if (!system) {
    system = await System.create({
      currentToken: 101,
      avgTime: 7
    });
  }

  res.json(system);
});

module.exports = router;
