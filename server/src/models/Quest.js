import mongoose from "mongoose";

const questSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["post", "comment", "login", "profile", "follow", "like", "chat"],
      required: true,
    },
    targetCount: {
      type: Number,
      default: 1,
    },
    reward: {
      points: { type: Number, default: 0 },
      badge: { type: String, default: null },
      vipDays: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Quest = mongoose.model("Quest", questSchema);

export default Quest;
