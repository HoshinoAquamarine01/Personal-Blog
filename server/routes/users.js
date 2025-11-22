import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../model/User.js";
import { verifyToken, verifyAdmin, verifyManager } from "../middleware/auth.js";

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/users";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "user-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Search users by username
router.get("/search", verifyToken, async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      return res.json({ users: [] });
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      username: { $regex: username, $options: "i" },
    })
      .select("username email avatar bio role")
      .limit(10);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (manager and admin)
router.get("/", verifyToken, verifyManager, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});

// Update user profile
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, bio, avatar },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

// Upload avatar
router.post(
  "/avatar",
  verifyToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const avatarUrl = `/uploads/users/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.userId,
        { avatar: avatarUrl },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ avatar: avatarUrl, user });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// Upload cover image
router.post("/cover", verifyToken, upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const coverUrl = `/uploads/users/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { coverImage: coverUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ coverImage: coverUrl, user });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post("/:id/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error changing password", error: error.message });
  }
});

// Ban user (manager and admin)
router.patch("/:id/ban", verifyToken, verifyManager, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent banning admin
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot ban admin users" });
    }

    // Manager cannot ban other managers
    if (req.user.role === "manager" && user.role === "manager") {
      return res.status(403).json({ message: "Cannot ban other managers" });
    }

    user.isBanned = true;
    await user.save();

    res.json({ message: "User banned successfully", user: user.toJSON() });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error banning user", error: error.message });
  }
});

// Unban user (manager and admin)
router.patch("/:id/unban", verifyToken, verifyManager, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBanned = false;
    await user.save();

    res.json({ message: "User unbanned successfully", user: user.toJSON() });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error unbanning user", error: error.message });
  }
});

// Delete user (manager and admin)
router.delete("/:id", verifyToken, verifyManager, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting admin
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Manager cannot delete other managers
    if (req.user.role === "manager" && user.role === "manager") {
      return res.status(403).json({ message: "Cannot delete other managers" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
});

// Follow user
router.post("/:id/follow", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following
    if (currentUser.following?.includes(targetUserId)) {
      return res.status(400).json({ error: "Already following this user" });
    }

    // Add to following/followers
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: "Followed successfully",
      isFollowing: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow user
router.delete("/:id/follow", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from following/followers
    currentUser.following =
      currentUser.following?.filter((id) => id.toString() !== targetUserId) ||
      [];

    targetUser.followers =
      targetUser.followers?.filter((id) => id.toString() !== currentUserId) ||
      [];

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: "Unfollowed successfully",
      isFollowing: false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if following
router.get("/:id/is-following", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const isFollowing = currentUser.following?.includes(req.params.id) || false;

    res.json({ isFollowing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
