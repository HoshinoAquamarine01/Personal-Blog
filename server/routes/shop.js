import express from "express";
import User from "../model/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get shop items
router.get("/effects", (req, res) => {
  const effects = [
    { id: "rainbow", name: "Rainbow Border", price: 50, description: "Colorful rainbow border" },
    { id: "glow", name: "Neon Glow", price: 30, description: "Glowing neon effect" },
    { id: "sparkle", name: "Sparkle Animation", price: 75, description: "Sparkling stars" },
    { id: "fire", name: "Fire Effect", price: 60, description: "Burning fire animation" }
  ];
  res.json({ effects });
});

// Buy effect
router.post("/buy-effect", verifyToken, async (req, res) => {
  try {
    const { effectId, price } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.coins < price) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    if (user.ownedEffects.includes(effectId)) {
      return res.status(400).json({ message: "Effect already owned" });
    }

    user.coins -= price;
    user.ownedEffects.push(effectId);
    await user.save();

    res.json({
      message: "Effect purchased successfully",
      coins: user.coins,
      ownedEffects: user.ownedEffects
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add coins (for testing)
router.post("/add-coins", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    
    user.coins += amount || 100;
    await user.save();

    res.json({ message: "Coins added", coins: user.coins });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;