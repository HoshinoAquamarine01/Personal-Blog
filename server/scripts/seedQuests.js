import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Import Quest model
const questSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    targetCount: { type: Number, default: 1 },
    reward: {
      points: { type: Number, default: 0 },
      badge: { type: String, default: null },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Quest = mongoose.model("Quest", questSchema);

const quests = [
  {
    title: "Tạo bài viết đầu tiên",
    description: "Viết và đăng bài viết đầu tiên của bạn",
    type: "post",
    targetCount: 1,
    reward: {
      points: 100,
      badge: "Tác giả mới",
    },
    isActive: true,
  },
  {
    title: "Tác giả năng suất",
    description: "Đăng 5 bài viết",
    type: "post",
    targetCount: 5,
    reward: {
      points: 500,
      badge: "Tác giả năng suất",
    },
    isActive: true,
  },
  {
    title: "Hoàn thiện hồ sơ",
    description: "Cập nhật avatar và tiểu sử",
    type: "profile",
    targetCount: 1,
    reward: {
      points: 50,
      badge: "Hồ sơ hoàn chỉnh",
    },
    isActive: true,
  },
  {
    title: "Người giao lưu",
    description: "Gửi 10 tin nhắn",
    type: "chat",
    targetCount: 10,
    reward: {
      points: 200,
      badge: "Người giao lưu",
    },
    isActive: true,
  },
  {
    title: "Người kết nối",
    description: "Theo dõi 5 người dùng",
    type: "follow",
    targetCount: 5,
    reward: {
      points: 150,
      badge: "Người kết nối",
    },
    isActive: true,
  },
];

async function seedQuests() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/blog";
    console.log("Connecting to:", mongoUri);

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const count = await Quest.countDocuments();
    console.log(`Found ${count} existing quests`);

    await Quest.deleteMany({});
    console.log("🗑️  Cleared existing quests");

    const result = await Quest.insertMany(quests);
    console.log(`✅ Seeded ${result.length} quests successfully`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding quests:", error);
    process.exit(1);
  }
}

seedQuests();
