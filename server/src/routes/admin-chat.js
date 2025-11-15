const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ChatSettings = require("../models/ChatSettings");
const Chat = require("../models/Chat");

// Middleware check admin
const isAdmin = async (req, res, next) => {
  const User = require("../models/User");
  const user = await User.findById(req.userId);
  if (user?.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

// Get chat settings
router.get("/settings", auth, isAdmin, async (req, res) => {
  try {
    let settings = await ChatSettings.findOne();
    if (!settings) {
      settings = await ChatSettings.create({ globalChatEnabled: true });
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle global chat
router.put("/toggle-global", auth, isAdmin, async (req, res) => {
  try {
    let settings = await ChatSettings.findOne();
    if (!settings) {
      settings = await ChatSettings.create({ globalChatEnabled: false });
    } else {
      settings.globalChatEnabled = !settings.globalChatEnabled;
      await settings.save();
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Block user from chatting
router.post("/block-user/:userId", auth, isAdmin, async (req, res) => {
  try {
    const settings =
      (await ChatSettings.findOne()) || (await ChatSettings.create({}));
    if (!settings.blockedUsers.includes(req.params.userId)) {
      settings.blockedUsers.push(req.params.userId);
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unblock user
router.delete("/unblock-user/:userId", auth, isAdmin, async (req, res) => {
  try {
    const settings = await ChatSettings.findOne();
    settings.blockedUsers = settings.blockedUsers.filter(
      (id) => id.toString() !== req.params.userId
    );
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all chats (for monitoring)
router.get("/all-chats", auth, isAdmin, async (req, res) => {
  try {
    const chats = await Chat.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
