import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const ChangePassword = () => {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from old password");
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword(user._id, oldPassword, newPassword);
      if (result.success) {
        setSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate("/profile/" + user._id), 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to change password");
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
              <i className="fas fa-key text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Change Password
            </h1>
            <p className="text-gray-600">Update your password securely</p>
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
                <i className="fas fa-lock text-primary mr-2"></i>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-control"
                  placeholder="Enter your current password"
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
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control"
                placeholder="Enter new password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock text-primary mr-2"></i>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              <i className="fas fa-check"></i>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <a
              href={"/profile/" + user?._id}
              className="text-primary hover:opacity-80 font-semibold transition-opacity"
            >
              ← Back to Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
