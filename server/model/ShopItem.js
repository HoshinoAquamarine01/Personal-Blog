import mongoose from "mongoose";

const ShopItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    effectId: {
      type: String,
      required: true,
      unique: true,
    },
    effectType: {
      type: String,
      enum: ["avatar", "badge", "theme"],
      default: "avatar",
    },
    icon: {
      type: String,
      default: "fa-star",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ShopItem = mongoose.models.ShopItem || mongoose.model("ShopItem", ShopItemSchema);

export default ShopItem;
