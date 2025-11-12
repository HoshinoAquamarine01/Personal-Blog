import express from "express";
import Quest from "../model/Quest.js";
import UserQuest from "../model/UserQuest.js";
import User from "../model/User.js";
import { verifyToken, verifyManager } from "../middleware/auth.js";

const router = express.Router();

// Get all quests
router.get("/", verifyToken, async (req, res) => {
  try {
    const quests = await Quest.find({ isActive: true });
    const userQuests = await UserQuest.find({ user: req.user.id });
    
    const questsWithProgress = quests.map(quest => {
      const userQuest = userQuests.find(uq => uq.quest.toString() === quest._id.toString());
      return {
        ...quest.toObject(),
        progress: userQuest?.progress || 0,
        completed: userQuest?.completed || false,
        claimed: userQuest?.claimed || false,
      };
    });

    res.json(questsWithProgress);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quests", error: error.message });
  }
});

// Claim quest reward
router.post("/:id/claim", verifyToken, async (req, res) => {
  try {
    const userQuest = await UserQuest.findOne({ user: req.user.id, quest: req.params.id });
    
    if (!userQuest || !userQuest.completed || userQuest.claimed) {
      return res.status(400).json({ message: "Cannot claim this quest" });
    }

    const quest = await Quest.findById(req.params.id);
    const user = await User.findById(req.user.id);

    user.coins += quest.reward;
    await user.save();

    userQuest.claimed = true;
    await userQuest.save();

    res.json({ message: "Reward claimed", coins: user.coins });
  } catch (error) {
    res.status(500).json({ message: "Error claiming reward", error: error.message });
  }
});

// Create quest (manager/admin)
router.post("/", verifyToken, verifyManager, async (req, res) => {
  try {
    const quest = new Quest(req.body);
    await quest.save();
    res.status(201).json(quest);
  } catch (error) {
    res.status(500).json({ message: "Error creating quest", error: error.message });
  }
});

// Update quest (manager/admin)
router.put("/:id", verifyToken, verifyManager, async (req, res) => {
  try {
    const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quest);
  } catch (error) {
    res.status(500).json({ message: "Error updating quest", error: error.message });
  }
});

// Delete quest (manager/admin)
router.delete("/:id", verifyToken, verifyManager, async (req, res) => {
  try {
    await Quest.findByIdAndDelete(req.params.id);
    res.json({ message: "Quest deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting quest", error: error.message });
  }
});

export default router;
