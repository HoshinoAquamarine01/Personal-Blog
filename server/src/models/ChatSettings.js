const mongoose = require("mongoose");

const chatSettingsSchema = new mongoose.Schema({
  globalChatEnabled: {
    type: Boolean,
    default: true,
  },
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  blockedPairs: [
    {
      user1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      user2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

module.exports = mongoose.model("ChatSettings", chatSettingsSchema);
