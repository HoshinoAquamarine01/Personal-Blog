import express from "express";
import ShopItem from "../model/ShopItem.js";
import User from "../model/User.js";
import { verifyToken, verifyManager } from "../middleware/auth.js";

const router = express.Router();

// Get all shop items
router.get("/", async (req, res) => {
  try {
    const items = await ShopItem.find({ isAvailable: true });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop items", error: error.message });
  }
});

// Purchase item
router.post("/purchase/:id", verifyToken, async (req, res) => {
  try {
    const item = await ShopItem.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (user.coins < item.price) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    if (user.ownedEffects.includes(item.effectId)) {
      return res.status(400).json({ message: "Already owned" });
    }

    user.coins -= item.price;
    user.ownedEffects.push(item.effectId);
    await user.save();

    res.json({ message: "Purchase successful", coins: user.coins, ownedEffects: user.ownedEffects });
  } catch (error) {
    res.status(500).json({ message: "Error purchasing item", error: error.message });
  }
});

// Equip effect
router.post("/equip/:effectId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.ownedEffects.includes(req.params.effectId)) {
      return res.status(400).json({ message: "Effect not owned" });
    }

    user.activeEffect = req.params.effectId;
    await user.save();

    res.json({ message: "Effect equipped", activeEffect: user.activeEffect });
  } catch (error) {
    res.status(500).json({ message: "Error equipping effect", error: error.message });
  }
});

// Create shop item (manager/admin)
router.post("/", verifyToken, verifyManager, async (req, res) => {
  try {
    const item = new ShopItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error creating item", error: error.message });
  }
});

// Update shop item (manager/admin)
router.put("/:id", verifyToken, verifyManager, async (req, res) => {
  try {
    const item = await ShopItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error: error.message });
  }
});

// Delete shop item (manager/admin)
router.delete("/:id", verifyToken, verifyManager, async (req, res) => {
  try {
    await ShopItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
});

export default router;
