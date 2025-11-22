import express from "express";
import Quest from "../model/Quest.js";
import UserQuest from "../model/UserQuest.js";
import User from "../model/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get all active quests
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Fetching quests for user:", req.userId);

    const quests = await Quest.find({ isActive: true });
    console.log("Found quests:", quests.length);

    const questsWithProgress = await Promise.all(
      quests.map(async (quest) => {
        const userQuest = await UserQuest.findOne({
          userId: req.userId,
          questId: quest._id,
        });

        return {
          ...quest.toObject(),
          progress: userQuest?.progress || 0,
          isCompleted: userQuest?.isCompleted || false,
          rewardClaimed: userQuest?.rewardClaimed || false,
        };
      })
    );

    res.json({ quests: questsWithProgress });
  } catch (error) {
    console.error("Error fetching quests:", error);
    res.status(500).json({ error: error.message });
  }
});

// Claim quest reward
router.post("/:questId/claim", verifyToken, async (req, res) => {
  try {
    const { questId } = req.params;

    const userQuest = await UserQuest.findOne({
      userId: req.userId,
      questId,
      isCompleted: true,
      rewardClaimed: false,
    });

    if (!userQuest) {
      return res.status(400).json({
        error: "Quest not completed or reward already claimed",
      });
    }

    const quest = await Quest.findById(questId);
    const user = await User.findById(req.userId);

    if (quest.reward.points) {
      user.points = (user.points || 0) + quest.reward.points;
    }
    if (quest.reward.badge) {
      if (!user.badges) user.badges = [];
      user.badges.push(quest.reward.badge);
    }

    await user.save();

    userQuest.rewardClaimed = true;
    await userQuest.save();

    res.json({
      success: true,
      message: "Đã nhận thưởng!",
      rewards: quest.reward,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
