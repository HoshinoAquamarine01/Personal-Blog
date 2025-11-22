import mongoose from "mongoose";

const userQuestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userQuestSchema.index({ userId: 1, questId: 1 }, { unique: true });

const UserQuest = mongoose.model("UserQuest", userQuestSchema);

export default UserQuest;
