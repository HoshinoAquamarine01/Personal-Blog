import express from "express";
import EmailConfig from "../model/EmailConfig.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get email settings
router.get("/email-config", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const config = await EmailConfig.findOne();
    if (!config) {
      return res.json({
        emailService: "gmail",
        emailUser: "",
        message: "No config found",
      });
    }
    res.json({
      emailService: config.emailService,
      emailUser: config.emailUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching config", error: error.message });
  }
});

// Update email settings
router.put("/email-config", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { emailService, emailUser, emailPassword } = req.body;

    if (!emailService || !emailUser || !emailPassword) {
      return res.status(400).json({ message: "All email fields required" });
    }

    let config = await EmailConfig.findOne();
    if (!config) {
      config = new EmailConfig();
    }

    config.emailService = emailService;
    config.emailUser = emailUser;
    config.emailPassword = emailPassword;
    await config.save();

    res.json({
      message: "Email config updated successfully",
      emailService: config.emailService,
      emailUser: config.emailUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating config", error: error.message });
  }
});

// Update user coins
router.put("/users/:id/coins", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { coins, action } = req.body; // action: 'add' or 'set'
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (action === "add") {
      user.coins = (user.coins || 0) + parseInt(coins);
    } else if (action === "set") {
      user.coins = parseInt(coins);
    }

    await user.save();

    res.json({
      success: true,
      message: "Updated coins successfully",
      user: {
        _id: user._id,
        username: user.username,
        coins: user.coins,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user points
router.put("/users/:id/points", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { points, action } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (action === "add") {
      user.points = (user.points || 0) + parseInt(points);
    } else if (action === "set") {
      user.points = parseInt(points);
    }

    await user.save();

    res.json({
      success: true,
      message: "Updated points successfully",
      user: {
        _id: user._id,
        username: user.username,
        points: user.points,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
