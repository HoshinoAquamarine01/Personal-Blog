import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.username.length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      console.error(err);
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
              <i className="fas fa-user-plus text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join our community today</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-error mb-4 animate-slideUp">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4 animate-slideUp">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-user text-primary mr-2"></i>
                Username
              </label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-envelope text-primary mr-2"></i>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock text-primary mr-2"></i>
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock text-primary mr-2"></i>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              <i className="fas fa-user-plus"></i>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Already have an account?</p>
            <Link
              to="/login"
              className="text-primary hover:opacity-80 font-semibold transition-opacity"
            >
              <i className="fas fa-sign-in-alt mr-1"></i>Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
