import mongoose from "mongoose";

const EmailConfigSchema = new mongoose.Schema(
  {
    emailService: {
      type: String,
      default: "gmail",
    },
    emailUser: {
      type: String,
      required: true,
    },
    emailPassword: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const EmailConfig =
  mongoose.models.EmailConfig ||
  mongoose.model("EmailConfig", EmailConfigSchema);

export default EmailConfig;
