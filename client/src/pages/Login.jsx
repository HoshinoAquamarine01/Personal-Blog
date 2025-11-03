import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import "../style/Adminlogin.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Attempting login with:", email);

      // Use Auth Context's login function (it handles API call)
      const result = await login(email, password);

      console.log("📊 Login result:", result);

      if (result.success && result.user) {
        console.log("✅ Login successful! User:", result.user);
        setSuccessMsg(
          `Welcome back, ${result.user.username || result.user.email}!`
        );
        setLoading(false);

        // Redirect after 1 second
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        console.log("❌ Login failed:", result.message);
        setError(result.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.error("❌ Login exception:", err);
      setError("An unexpected error occurred");
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

          {successMsg && (
            <div
              style={{
                background: "#efe",
                color: "#0a0",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.95rem",
              }}
            >
              <i className="fas fa-check-circle"></i>
              <span>{successMsg}</span>
            </div>
          )}

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
              <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
                <a
                  href="/forgot-password"
                  style={{
                    color: "#667eea",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                  }}
                >
                  Forgot Password?
                </a>
              </div>
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
