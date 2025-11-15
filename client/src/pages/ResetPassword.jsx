import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

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
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md">
          <div className="card shadow-2xl text-center animate-slideInScale">
            <div className="mb-4">
              <i className="fas fa-times-circle text-5xl text-danger mb-4 block"></i>
              <h2 className="text-2xl font-bold text-danger mb-2">
                Invalid Access
              </h2>
              <p className="text-gray-600 mb-6">
                Please request a new reset code.
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="btn btn-primary w-full"
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
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md">
          <div className="card shadow-2xl text-center animate-slideInScale">
            <i className="fas fa-check-circle text-6xl text-green-500 mb-4 block"></i>
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Password Reset!
            </h2>
            <p className="text-gray-600 mb-2">
              Your password has been reset successfully.
            </p>
            <p className="text-sm text-gray-500">Redirecting to home...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="card shadow-2xl animate-slideInScale">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
              <i className="fas fa-lock text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">Enter code and new password</p>
          </div>

          {/* Error Message */}
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
                <i className="fas fa-hashtag text-primary mr-2"></i>
                Reset Code
              </label>
              <input
                type="text"
                className="form-control text-center text-2xl font-bold letter-spacing tracking-widest"
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength="6"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock text-primary mr-2"></i>
                New Password
              </label>
              <div className="relative">
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
                  className="absolute right-4 top-4 text-primary hover:opacity-80"
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock text-primary mr-2"></i>
                Confirm Password
              </label>
              <div className="relative">
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
                  className="absolute right-4 top-4 text-primary hover:opacity-80"
                >
                  <i
                    className={
                      showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              <i className="fas fa-check"></i>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <a
              href="/login"
              className="text-primary hover:opacity-80 font-semibold transition-opacity"
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
