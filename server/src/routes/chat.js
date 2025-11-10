const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Chat = require("../models/Chat");
const ChatSettings = require("../models/ChatSettings");
const User = require("../models/User");

// Get chat history giữa 2 users
router.get("/history/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    const messages = await Chat.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post("/send", auth, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.userId;

    // Check chat settings
    const settings = await ChatSettings.findOne();
    if (settings && !settings.globalChatEnabled) {
      return res.status(403).json({ error: "Chat is disabled by admin" });
    }

    // Check if blocked
    if (settings?.blockedUsers.includes(senderId)) {
      return res.status(403).json({ error: "You are blocked from chatting" });
    }

    const newMessage = new Chat({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    await newMessage.save();
    await newMessage.populate("sender", "username avatar");
    await newMessage.populate("receiver", "username avatar");

    res.json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat list (all conversations)
router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$message" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const populatedConversations = await User.populate(conversations, {
      path: "_id",
      select: "username avatar",
    });

    res.json({ conversations: populatedConversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.put("/read/:userId", auth, async (req, res) => {
  try {
    await Chat.updateMany(
      { sender: req.params.userId, receiver: req.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
