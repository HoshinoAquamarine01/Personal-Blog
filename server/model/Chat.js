import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ChatSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
