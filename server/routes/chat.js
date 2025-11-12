import express from "express";
import mongoose from "mongoose";
import Chat from "../model/Chat.js";
import Notification from "../model/Notification.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Get conversations list
router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const messages = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    const conversations = await Promise.all(
      messages.map(async (msg) => {
        const otherUserId = msg._id;
        const user = await mongoose.model("User").findById(otherUserId).select("username avatar");

        return {
          user,
          lastMessage: msg.lastMessage,
        };
      })
    );

    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: error.message });
  }
});

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/chat";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "file-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Get chat history
router.get("/history/:userId", verifyToken, async (req, res) => {
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
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post("/send", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.userId;

    console.log("Sending message:", { senderId, receiverId, message });

    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      message: message || "",
    };

    if (req.file) {
      newMessage.fileUrl = `/uploads/chat/${req.file.filename}`;
      newMessage.fileType = req.file.mimetype;
    }

    const chatMessage = await Chat.create(newMessage);
    await chatMessage.populate("sender", "username avatar");
    await chatMessage.populate("receiver", "username avatar");

    // Create notification
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "message",
      content: `${chatMessage.sender.username} đã gửi tin nhắn cho bạn`,
      link: `/chat/${senderId}`,
    });

    console.log("Message sent:", chatMessage);

    res.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
