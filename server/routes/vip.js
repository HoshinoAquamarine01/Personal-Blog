import express from "express";
import User from "../model/User.js";
import Payment from "../model/Payment.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get VIP pricing
router.get("/pricing", (req, res) => {
  res.json({
    plans: [
      { duration: 30, price: 50000, label: "1 tháng" },
      { duration: 90, price: 120000, label: "3 tháng" },
      { duration: 180, price: 200000, label: "6 tháng" },
      { duration: 365, price: 350000, label: "1 năm" },
    ],
  });
});

// Create payment
router.post("/purchase", verifyToken, async (req, res) => {
  try {
    const { duration, method } = req.body;

    const pricing = {
      30: 50000,
      90: 120000,
      180: 200000,
      365: 350000,
    };

    const amount = pricing[duration];
    if (!amount) {
      return res.status(400).json({ message: "Invalid duration" });
    }

    const transactionId = `VIP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const payment = new Payment({
      user: req.user.id,
      amount,
      method,
      vipDuration: duration,
      transactionId,
    });

    await payment.save();

    // Generate payment URLs for different methods
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const returnUrl = `${baseUrl}/payment/return/${payment._id}`;
    
    let paymentUrl = "";
    
    switch(method) {
      case "momo":
        paymentUrl = `https://test-payment.momo.vn/v2/gateway/pay?amount=${amount}&orderId=${transactionId}&returnUrl=${encodeURIComponent(returnUrl)}`;
        break;
      case "zalopay":
        paymentUrl = `https://sbgateway.zalopay.vn/pay?amount=${amount}&orderId=${transactionId}&returnUrl=${encodeURIComponent(returnUrl)}`;
        break;
      case "vnpay":
        paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${amount * 100}&vnp_TxnRef=${transactionId}&vnp_ReturnUrl=${encodeURIComponent(returnUrl)}`;
        break;
      case "bank_transfer":
        paymentUrl = `/payment/bank/${payment._id}`;
        break;
      default:
        paymentUrl = `/payment/${payment._id}`;
    }

    res.json({
      message: "Payment created",
      payment,
      paymentUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating payment", error: error.message });
  }
});

// Confirm payment (simulate)
router.post("/confirm/:paymentId", verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    payment.status = "completed";
    await payment.save();

    const user = await User.findById(req.user.id);
    const now = new Date();
    const currentExpiry = user.vipExpiresAt && user.vipExpiresAt > now ? user.vipExpiresAt : now;
    
    user.isVip = true;
    user.vipExpiresAt = new Date(currentExpiry.getTime() + payment.vipDuration * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({ message: "VIP activated", user });
  } catch (error) {
    res.status(500).json({ message: "Error confirming payment", error: error.message });
  }
});

// Update theme
router.patch("/theme", verifyToken, async (req, res) => {
  try {
    const { theme } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.isVip && user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ message: "VIP required" });
    }

    user.theme = theme;
    await user.save();

    res.json({ message: "Theme updated", theme: user.theme });
  } catch (error) {
    res.status(500).json({ message: "Error updating theme", error: error.message });
  }
});

// Get payment history
router.get("/payments", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
});

export default router;
