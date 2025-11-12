import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/postsRoute.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import notificationRoutes from "./routes/notifications.js";
import vipRoutes from "./routes/vip.js";
import questRoutes from "./routes/quests.js";
import shopRoutes from "./routes/shop.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4500;
const MONGO_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/blog";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/vip", vipRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/shop", shopRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Connect MongoDB
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
