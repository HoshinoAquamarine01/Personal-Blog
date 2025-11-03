import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import "../style/Adminlogin.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { requestPasswordReset, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      // Auto redirect to reset password after 2 seconds
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
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
                ✅ Code Sent!
              </h2>
              <p style={{ margin: "0.5rem 0", marginBottom: "1rem" }}>
                Check your email for the reset code.
              </p>
              <p
                style={{ margin: "0.5rem 0", fontSize: "0.9rem", opacity: 0.8 }}
              >
                Redirecting to reset password...
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
            <i className="fas fa-key"></i>
            <h1>Forgot Password</h1>
            <p>Enter your email to reset password</p>
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
                <i className="fas fa-envelope"></i>
                Email Address
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

            <button type="submit" className="btn-login" disabled={loading}>
              <i className="fas fa-paper-plane"></i>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <div className="login-footer">
            <p>Remember your password?</p>
            <a
              href="/login"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Login here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
