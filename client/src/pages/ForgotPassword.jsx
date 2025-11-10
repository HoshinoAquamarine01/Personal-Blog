import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md">
          <div className="card shadow-2xl text-center animate-slideInScale">
            <i className="fas fa-check-circle text-6xl text-green-500 mb-4 block"></i>
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Code Sent!
            </h2>
            <p className="text-gray-600 mb-2">
              Check your email for the reset code.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to reset password...
            </p>
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
              <i className="fas fa-key text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Forgot Password
            </h1>
            <p className="text-gray-600">Enter your email to reset password</p>
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
                <i className="fas fa-envelope text-primary mr-2"></i>
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

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              <i className="fas fa-paper-plane"></i>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Remember your password?</p>
            <a
              href="/login"
              className="text-primary hover:opacity-80 font-semibold transition-opacity"
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
