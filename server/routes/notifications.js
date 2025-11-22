import express from "express";
import Notification from "../model/Notification.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get all notifications
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("fromUser", "username avatar");

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.put("/mark-all-read", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
