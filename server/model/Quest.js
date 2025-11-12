import mongoose from "mongoose";

const QuestSchema = new mongoose.Schema(
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
      enum: ["daily", "weekly", "achievement"],
      default: "daily",
    },
    requirement: {
      type: Number,
      required: true,
    },
    reward: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
      default: "fa-tasks",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Quest = mongoose.models.Quest || mongoose.model("Quest", QuestSchema);

export default Quest;
