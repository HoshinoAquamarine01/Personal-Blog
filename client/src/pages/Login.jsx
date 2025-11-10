import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("✅ Google script loaded");
        if (window.google) {
          console.log("🔐 Initializing Google Sign-In...");
          window.google.accounts.id.initialize({
            client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
            callback: handleGoogleLogin,
          });

          // Wait for DOM to be ready
          setTimeout(() => {
            const buttonDiv = document.getElementById("google-signin-button");
            if (buttonDiv) {
              console.log("✅ Rendering Google button");
              window.google.accounts.id.renderButton(buttonDiv, {
                theme: "outline",
                size: "large",
                width: "100%",
              });
            } else {
              console.error("❌ Google button container not found");
            }
          }, 100);
        }
      };
      script.onerror = () => {
        console.error("❌ Failed to load Google script");
        setError("Failed to load Google Sign-In");
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();

    // Load Facebook SDK
    window.fbAsyncInit = function () {
      if (window.FB) {
        console.log("✅ Facebook SDK initialized");
        window.FB.init({
          appId: "YOUR_FACEBOOK_APP_ID",
          xfbml: true,
          version: "v18.0",
        });
      }
    };

    if (!window.FB) {
      const fbScript = document.createElement("script");
      fbScript.src = "https://connect.facebook.net/en_US/sdk.js";
      fbScript.async = true;
      fbScript.defer = true;
      document.body.appendChild(fbScript);
    }
  }, []);

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
      const result = await login(email, password);

      if (result.success && result.user) {
        console.log("✅ Login successful!");
        setSuccessMsg(
          `Welcome back, ${result.user.username || result.user.email}!`
        );
        setLoading(false);
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

  const handleGoogleLogin = async (response) => {
    console.log("🔐 Google login response received");

    if (response.credential) {
      try {
        const token = response.credential;
        const decoded = JSON.parse(atob(token.split(".")[1]));

        console.log("👤 Google user:", decoded);

        await socialLoginRequest({
          provider: "google",
          email: decoded.email,
          username: decoded.name,
          avatar: decoded.picture,
          providerId: decoded.sub,
        });
      } catch (err) {
        console.error("❌ Google token decode error:", err);
        setError("Failed to process Google login");
      }
    } else {
      setError("Google login was cancelled");
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setError("Facebook SDK not loaded. Please refresh the page.");
      return;
    }

    window.FB.login(
      (response) => {
        console.log("🔐 Facebook login response:", response);

        if (response.authResponse) {
          window.FB.api(
            "/me",
            { fields: "id,name,email,picture" },
            async (user) => {
              console.log("👤 Facebook user:", user);

              await socialLoginRequest({
                provider: "facebook",
                email: user.email,
                username: user.name,
                avatar: user.picture?.data?.url,
                providerId: user.id,
              });
            }
          );
        } else {
          setError("Facebook login cancelled");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  const socialLoginRequest = async (data) => {
    try {
      setLoading(true);
      setError("");

      console.log("📤 Sending social login request:", data);

      const res = await api.post("/auth/social-login", data);

      console.log("✅ Social login response:", res.data);

      if (res.data.token && res.data.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccessMsg(`Welcome, ${res.data.user.username}!`);
        setTimeout(() => navigate("/"), 1000);
      } else {
        setError("Login failed - invalid response");
      }
    } catch (err) {
      console.error("❌ Social login error:", err);
      setError(
        err.response?.data?.message || "Social login failed. Please try again."
      );
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
              <i className="fas fa-sign-in-alt text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Login to your account</p>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="alert alert-success mb-4 animate-slideUp">
              <i className="fas fa-check-circle"></i>
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-4 animate-slideUp">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 mb-6">
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

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock text-primary mr-2"></i>
                Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <div className="mt-2 text-right">
                <a
                  href="/forgot-password"
                  className="text-primary hover:opacity-80 text-sm font-medium transition-opacity"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              <i className="fas fa-sign-in-alt"></i>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3 mb-6">
            <div
              id="google-signin-button"
              className="flex justify-center"
            ></div>
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              <i className="fab fa-facebook"></i>
              Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Don't have an account?</p>
            <a
              href="/register"
              className="text-primary hover:opacity-80 font-semibold transition-opacity"
            >
              Create one here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
