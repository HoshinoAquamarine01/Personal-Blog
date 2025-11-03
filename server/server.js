import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/postsRoute.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4500;
const MONGO_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/blog";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

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
