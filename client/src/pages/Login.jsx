import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";
import "../style/Adminlogin.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await api.post("/auth/login", { email, password });

    // Kiểm tra rõ ràng token & user
    if (response.data?.token && response.data?.user) {
      localStorage.setItem("token", response.data.token);
      login(response.data.user);

      // Chỉ chuyển trang khi login thành công thật
      navigate("/");
    } else {
      throw new Error("Invalid login response from server.");
    }
  } catch (err) {
    // Reset loading
    setLoading(false);

    // Xử lý lỗi rõ ràng
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Invalid email or password. Please try again.";

    setError(errorMsg);
    console.error("Login error:", err);
  }
};
  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <i className="fas fa-sign-in-alt"></i>
            <h1>Login</h1>
            <p>Welcome back to My Blog</p>
          </div>

          {error && (
            <div
              style={{
                background: "#fee",
                color: "#c00",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.95rem",
              }}
            >
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>
                <i className="fas fa-envelope"></i>
                Email
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-lock"></i>
                Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              <i className="fas fa-sign-in-alt"></i>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account?</p>
            <a
              href="/register"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
