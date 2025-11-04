import express from "express";
import Post from "../model/Post.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all posts (public)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email role")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
});

// Get post by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username email role")
      .populate("comments.author", "username email role");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching post", error: error.message });
  }
});

// Create post (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log("📝 CREATE POST REQUEST");
    console.log("Body:", req.body);
    console.log("User:", { id: req.user.id, role: req.user.role });

    const { title, content, category, tags, thumbnail } = req.body;

    // Validate
    if (!title || !title.trim()) {
      console.warn("❌ No title");
      return res.status(400).json({ message: "Title is required" });
    }

    if (!content || !content.trim()) {
      console.warn("❌ No content");
      return res.status(400).json({ message: "Content is required" });
    }

    // Clean and prepare data
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanCategory = (category || "General").trim();
    const cleanThumbnail = (thumbnail || "").trim();

    // Process tags
    let cleanTags = [];
    if (Array.isArray(tags)) {
      cleanTags = tags
        .filter((t) => t && typeof t === "string")
        .map((t) => t.trim());
    } else if (typeof tags === "string" && tags.trim()) {
      cleanTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
    }

    console.log("✅ Cleaned data:", {
      title: cleanTitle.substring(0, 30),
      contentLength: cleanContent.length,
      category: cleanCategory,
      tagsCount: cleanTags.length,
      author: req.user.id,
    });

    const newPost = new Post({
      title: cleanTitle,
      content: cleanContent,
      category: cleanCategory,
      tags: cleanTags,
      thumbnail: cleanThumbnail,
      author: req.user.id,
      isPublished: true,
    });

    console.log("💾 Saving post...");
    const savedPost = await newPost.save();
    console.log("✅ Post saved:", savedPost._id);

    await savedPost.populate("author", "username email");
    console.log("✅ Post populated");

    res.status(201).json(savedPost);
  } catch (error) {
    console.error("❌ ERROR CREATING POST:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      errors: error.errors ? Object.keys(error.errors) : undefined,
    });

    res.status(500).json({
      message: error.message || "Error creating post",
      error: error.message,
    });
  }
});

// Update post (admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content, category, tags, thumbnail, isPublished } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        content: content.trim(),
        category: category || "General",
        tags: Array.isArray(tags) ? tags : [],
        thumbnail: thumbnail || "",
        isPublished,
      },
      { new: true, runValidators: true }
    ).populate("author", "username email");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating post", error: error.message });
  }
});

// Delete post (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
});

// Add comment (users + admin)
router.post("/:id/comments", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      text: text.trim(),
      author: req.user.id,
    });

    await post.save();
    await post.populate("author", "username email role");
    await post.populate("comments.author", "username email role");

    res.status(201).json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
});

// Delete comment (own comment or admin only)
router.delete("/:id/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if user is comment author or admin
    const isCommentAuthor = comment.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCommentAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    // Populate author data before sending response
    await post.populate("author", "username email role");
    await post.populate("comments.author", "username email role");

    res.json({ message: "Comment deleted successfully", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
});

// Increment views
router.patch("/:id/views", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "username email");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating views", error: error.message });
  }
});

// Like post
router.patch("/:id/like", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    ).populate("author", "username email");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error liking post", error: error.message });
  }
});

export default router;
