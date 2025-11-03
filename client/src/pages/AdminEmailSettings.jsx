import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../style/Adminlogin.css";

const AdminEmailSettings = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailService: "gmail",
    emailUser: "",
    emailPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate("/");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (
      !formData.emailService ||
      !formData.emailUser ||
      !formData.emailPassword
    ) {
      setError("All email fields are required");
      setLoading(false);
      return;
    }

    try {
      await api.put("/admin/email-config", formData);
      setSuccess("✅ Email settings updated successfully!");
      setFormData((prev) => ({
        ...prev,
        emailPassword: "",
      }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <i className="fas fa-envelope"></i>
            <h1>Email Settings</h1>
            <p>Configure email for password reset</p>
          </div>

          {success && (
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
              }}
            >
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
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
              }}
            >
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                <i className="fas fa-server"></i>
                Email Service
              </label>
              <select
                name="emailService"
                value={formData.emailService}
                onChange={handleChange}
                className="form-control"
              >
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="yahoo">Yahoo</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                name="emailUser"
                value={formData.emailUser}
                onChange={handleChange}
                className="form-control"
                placeholder="your-email@gmail.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-key"></i>
                App Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="emailPassword"
                  value={formData.emailPassword}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="xxxx xxxx xxxx xxxx"
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
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#666",
                  marginTop: "0.5rem",
                }}
              >
                Get App Password:{" "}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#667eea" }}
                >
                  myaccount.google.com/apppasswords
                </a>
              </p>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              <i className="fas fa-save"></i>
              {loading ? "Saving..." : "Save Email Settings"}
            </button>
          </form>

          <div className="login-footer">
            <a
              href="/"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailSettings;
