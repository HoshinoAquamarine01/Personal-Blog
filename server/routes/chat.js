import express from "express";
import Chat from "../model/Chat.js";
import { verifyToken } from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Send message with file support
router.post("/send", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.userId;

    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      message: message || "",
    };

    if (req.file) {
      newMessage.fileUrl = `/uploads/avatars/${req.file.filename}`;
      newMessage.fileType = req.file.mimetype;
    }

    const chatMessage = await Chat.create(newMessage);
    await chatMessage.populate("sender", "username avatar");
    await chatMessage.populate("receiver", "username avatar");

    res.json({ success: true, message: chatMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
