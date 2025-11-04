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

export default router;
