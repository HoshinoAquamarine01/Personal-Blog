import jwt from "jsonwebtoken";
import User from "../model/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    console.log("🔐 Verifying token...", {
      hasToken: !!token,
      authHeader: authHeader ? "Yes" : "No",
    });

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is banned
    const user = await User.findById(decoded.id);
    if (user?.isBanned) {
      console.log("🚫 Banned user attempted action:", decoded.email);
      return res.status(403).json({ message: "Your account has been banned" });
    }

    req.user = decoded;

    console.log("✅ Token verified:", {
      userId: decoded.id,
      role: decoded.role,
      username: decoded.username,
    });

    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    return res
      .status(401)
      .json({ message: "Invalid token", error: err.message });
  }
};

export const verifyAdmin = (req, res, next) => {
  console.log("👤 Checking admin role:", {
    userId: req.user?.id,
    role: req.user?.role,
  });

  if (req.user?.role !== "admin") {
    console.error("❌ Not admin:", req.user?.role);
    return res.status(403).json({ message: "Admin access required" });
  }

  console.log("✅ Admin verified");
  next();
};
