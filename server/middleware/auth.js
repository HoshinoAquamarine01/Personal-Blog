import jwt from "jsonwebtoken";
import User from "../model/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (user?.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const verifyManager = (req, res, next) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Manager or Admin access required" });
  }
  next();
};
