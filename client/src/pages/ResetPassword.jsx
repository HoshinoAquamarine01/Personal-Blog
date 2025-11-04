import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import "../style/Adminlogin.css";

const ResetPassword = () => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  if (!email) {
    return (
      <div className="admin-login-page">
        <div className="login-container">
          <div className="login-box">
            <div
              style={{
                background: "#fee",
                color: "#c00",
                padding: "2rem",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <i
                className="fas fa-times-circle"
                style={{
                  fontSize: "2rem",
                  marginBottom: "1rem",
                  display: "block",
                }}
              ></i>
              <h2 style={{ margin: "0.5rem 0" }}>Invalid Access</h2>
              <p style={{ margin: "0.5rem 0", marginBottom: "1.5rem" }}>
                Please request a new reset code.
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="btn-login"
              >
                <i className="fas fa-redo"></i>
                Request New Code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        code,
        password: newPassword,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-login-page">
        <div className="login-container">
          <div className="login-box">
            <div
              style={{
                background: "#efe",
                color: "#0a0",
                padding: "2rem",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <i
                className="fas fa-check-circle"
                style={{
                  fontSize: "3rem",
                  marginBottom: "1rem",
                  display: "block",
                }}
              ></i>
              <h2 style={{ margin: "0.5rem 0", color: "#0a0" }}>
                ✅ Password Reset!
              </h2>
              <p style={{ margin: "0.5rem 0", marginBottom: "1rem" }}>
                Your password has been reset successfully.
              </p>
              <p
                style={{ margin: "0.5rem 0", fontSize: "0.9rem", opacity: 0.8 }}
              >
                Redirecting to home...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <i className="fas fa-lock"></i>
            <h1>Reset Password</h1>
            <p>Enter code and new password</p>
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

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                <i className="fas fa-hashtag"></i>
                Reset Code
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength="6"
                required
                disabled={loading}
                style={{
                  fontSize: "2rem",
                  letterSpacing: "0.5rem",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-lock"></i>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    color: "#667eea",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-lock"></i>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    color: "#667eea",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className={
                      showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              <i className="fas fa-check"></i>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="login-footer">
            <a
              href="/login"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
