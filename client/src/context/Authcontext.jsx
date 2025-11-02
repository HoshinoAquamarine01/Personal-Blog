import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Khôi phục user từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // Đăng ký tài khoản mới
  const register = async (username, email, password, confirmPassword) => {
    try {
      setError(null);

      if (!username || !email || !password) {
        setError("All fields are required");
        return { success: false, message: "All fields are required" };
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return { success: false, message: "Passwords do not match" };
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return {
          success: false,
          message: "Password must be at least 6 characters",
        };
      }

      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true); // ✅ SET TRUE
      setError(null);

      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
      setIsAuthenticated(false); // ✅ SET FALSE
      return { success: false, message: errorMsg };
    }
  };

  // Đăng nhập
  const login = async (email, password) => {
    try {
      setError(null);
      console.log("🔐 Auth Context: login() called with email:", email);

      if (!email || !password) {
        setError("Email and password required");
        return { success: false, message: "Email and password required" };
      }

      const res = await api.post("/auth/login", { email, password });

      console.log("📥 Auth Context: API response:", res.data);

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid response structure");
      }

      console.log("💾 Auth Context: Saving to localStorage");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("🔄 Auth Context: Updating state");
      setUser(user);
      setIsAuthenticated(true);
      setError(null);

      console.log("✅ Auth Context: Login complete", {
        user,
        isAuthenticated: true,
      });

      return { success: true, user };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Login failed";
      console.error("❌ Auth Context: Login error:", errorMsg);
      setError(errorMsg);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, message: errorMsg };
    }
  };

  // Đăng xuất
  const logout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false); // ✅ SET FALSE
    setError(null);
  };

  // Cập nhật profile
  const updateProfile = async (userId, profileData) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      const res = await api.put(`/users/${userId}`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setError(null);

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Update failed";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Cập nhật avatar
  const updateAvatar = async (userId, avatarUrl) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/users/${userId}/avatar`,
        { avatar: avatarUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setError(null);

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Avatar update failed";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Đổi mật khẩu
  const changePassword = async (userId, oldPassword, newPassword) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      const res = await api.post(
        `/users/${userId}/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setError(null);
      return { success: true, message: res.data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Password change failed";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Kiểm tra user là admin
  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Lấy token hiện tại
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
    isAdmin,
    getToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
