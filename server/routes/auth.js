import express from "express";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import EmailConfig from "../model/EmailConfig.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || "reset-secret-key";

// Function to get transporter
const getTransporter = async () => {
  try {
    const config = await EmailConfig.findOne();
    if (config?.emailUser && config?.emailPassword) {
      return nodemailer.createTransport({
        service: config.emailService || "gmail",
        auth: {
          user: config.emailUser,
          pass: config.emailPassword,
        },
      });
    }
  } catch (err) {
    console.error("Error fetching email config:", err);
  }

  // Fallback to .env
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({
      username,
      email,
      password,
      role: "user",
      avatar: "",
      bio: "",
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
        username: newUser.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Return user object với _id
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar || "",
        bio: newUser.bio || "",
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Return user object với _id
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || "",
        bio: user.bio || "",
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Forgot Password - Send reset code via email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code in database (valid for 15 minutes)
    user.resetCode = resetCode;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email with code
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code - My Blog",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Code</h2>
          <p>Hi ${user.username},</p>
          <p>You requested a password reset. Use the code below to reset your password:</p>
          <div style="margin: 30px 0; text-align: center;">
            <div style="background: #f0f0f0; padding: 20px; border-radius: 5px; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #667eea; font-family: monospace;">
              ${resetCode}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">© My Blog. All rights reserved.</p>
        </div>
      `,
    };

    const transporter = await getTransporter();
    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully to:", email);
    res.json({
      message: "Reset code sent to your email. Code expires in 15 minutes.",
      email: email,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", {
      errorCode: error.code,
      errorMessage: error.message,
      email: email,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      message: "Failed to send reset code email",
      error: error.message,
    });
  }
});

// Verify reset code
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if code matches
    if (user.resetCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    // Check if code expired
    if (user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    res.json({
      message: "Code verified successfully",
      email: email,
    });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reset Password - Verify code and update password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res
        .status(400)
        .json({ message: "Email, code and password required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify code
    if (user.resetCode !== code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    if (user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    // Update password
    user.password = password;
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    // Generate new login token
    const loginToken = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Password reset successfully",
      token: loginToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || "",
        bio: user.bio || "",
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
