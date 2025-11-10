const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const upload = require("../middleware/uploadMiddleware");
const fs = require("fs");
const path = require("path");

// Search users by username - PHẢI ĐẶT TRƯỚC /:id
router.get("/search", auth, async (req, res) => {
  try {
    const { username } = req.query;

    console.log("Searching for username:", username);

    if (!username || username.trim() === "") {
      return res.json({ users: [] });
    }

    // Tìm chính xác theo username (case-insensitive)
    const users = await User.find({
      _id: { $ne: req.userId },
      username: { $regex: `^${username}$`, $options: "i" }, // Chính xác username
    })
      .select("username email avatar bio role")
      .limit(20);

    // Nếu không tìm thấy chính xác, tìm gần đúng
    if (users.length === 0) {
      const similarUsers = await User.find({
        _id: { $ne: req.userId },
        username: { $regex: username, $options: "i" }, // Tìm gần đúng
      })
        .select("username email avatar bio role")
        .limit(10);

      console.log("Found similar users:", similarUsers.length);
      return res.json({ users: similarUsers, isSimilar: true });
    }

    console.log("Found exact user:", users.length);
    res.json({ users, isExact: true });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Upload Avatar
router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findById(req.userId);

    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join(
        process.env.UPLOAD_DIR || "./uploads/avatars",
        path.basename(user.avatar)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user avatar
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      avatar: user.avatar,
      message: "Avatar updated successfully",
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Upload Cover Image
router.post("/cover", auth, upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findById(req.userId);

    // Delete old cover if exists
    if (user.coverImage) {
      const oldPath = path.join(
        process.env.UPLOAD_DIR || "./uploads/avatars",
        path.basename(user.coverImage)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user cover
    user.coverImage = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      coverImage: user.coverImage,
      message: "Cover image updated successfully",
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/:id", auth, async (req, res) => {
  try {
    const { username, email, bio, phone, location, website } = req.body;

    // Kiểm tra quyền
    if (req.userId !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền chỉnh sửa" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    await user.save();

    res.json({
      success: true,
      message: "Cập nhật thành công",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (for search)
router.get("/all", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select("username email avatar bio")
      .limit(50);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID - PHẢI ĐẶT SAU các route cụ thể
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
