import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

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
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="card shadow-2xl animate-slideInScale">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
              <i className="fas fa-envelope text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Email Settings
            </h1>
            <p className="text-gray-600">Configure email for password reset</p>
          </div>

          {/* Messages */}
          {success && (
            <div className="alert alert-success mb-4 animate-slideUp">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-4 animate-slideUp">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-server text-primary mr-2"></i>
                Email Service
              </label>
              <select
                name="emailService"
                value={formData.emailService}
                onChange={handleChange}
                className="filter-select"
              >
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="yahoo">Yahoo</option>
              </select>
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-envelope text-primary mr-2"></i>
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
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-key text-primary mr-2"></i>
                App Password
              </label>
              <div className="relative">
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
                  className="absolute right-4 top-4 text-primary hover:opacity-80"
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Get App Password:{" "}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80"
                >
                  myaccount.google.com/apppasswords
                </a>
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              <i className="fas fa-save"></i>
              {loading ? "Saving..." : "Save Email Settings"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <a
              href="/"
              className="text-primary hover:opacity-80 font-semibold transition-opacity"
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
