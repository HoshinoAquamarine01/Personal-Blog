import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [authState, setAuthState] = useState(isAuthenticated);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setAuthState(isAuthenticated);
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
    }
  };

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
    setIsProfileDropdown(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdown(false);
  };

  return (
    <nav className="navbar shadow-lg sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <i className="fas fa-blog text-blue-600 text-xl"></i>
          </div>
          <span className="text-white font-bold text-xl hidden sm:inline">
            MyBlog
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="navbar-links">
            <i className="fas fa-home"></i> Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/search-users" className="navbar-links">
                <i className="fas fa-search"></i> Tìm kiếm
              </Link>
              <Link to="/notifications" className="navbar-links relative">
                <i className="fas fa-bell"></i> Thông báo
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/inbox" className="navbar-links">
                <i className="fas fa-comment"></i> Tin nhắn
              </Link>
              <Link to="/quests" className="navbar-links">
                <i className="fas fa-tasks"></i> Nhiệm vụ
              </Link>
              <Link to="/shop" className="navbar-links">
                <i className="fas fa-store"></i> Cửa hàng
              </Link>
              {user?.isVip && user?.vipExpiresAt && (
                <Link
                  to="/vip"
                  className="navbar-links bg-linear-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700 relative"
                >
                  <i className="fas fa-crown"></i> VIP
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(user.vipExpiresAt) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}
                    d
                  </span>
                </Link>
              )}
              {!(
                user?.isVip ||
                user?.role === "admin" ||
                user?.role === "manager"
              ) && (
                <Link
                  to="/vip"
                  className="navbar-links bg-linear-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700"
                >
                  <i className="fas fa-crown"></i> VIP
                </Link>
              )}
              {(user?.isVip ||
                user?.role === "admin" ||
                user?.role === "manager") && (
                <Link to="/theme-settings" className="navbar-links">
                  <i className="fas fa-palette"></i> Theme
                </Link>
              )}
              {user?.role === "admin" && (
                <Link to="/admin/dashboard" className="navbar-links">
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link>
              )}
              {user?.role === "manager" && (
                <Link to="/manager/dashboard" className="navbar-links">
                  <i className="fas fa-user-tie"></i> Dashboard
                </Link>
              )}
              <Link to={`/profile/${user?._id}`} className="navbar-links">
                <i className="fas fa-user-circle"></i> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="navbar-links hover:bg-red-500"
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-links">
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link
                to="/register"
                className="navbar-links bg-white text-blue-600 hover:bg-gray-100"
              >
                <i className="fas fa-user-plus"></i> Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white text-2xl hover:opacity-80 transition-opacity"
        >
          <i className={`fas fa-${isMenuOpen ? "times" : "bars"}`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 border-t-2 border-blue-800 animate-slideDown">
          <div className="container py-4 space-y-2">
            <Link
              to="/"
              className="navbar-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-home"></i> Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/search-users"
                  className="navbar-mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-search"></i> Tìm kiếm
                </Link>
                <Link
                  to="/inbox"
                  className="navbar-mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-comment"></i> Tin nhắn
                </Link>
                <Link
                  to="/quests"
                  className="navbar-mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-tasks"></i> Nhiệm vụ
                </Link>
                {user?.isVip && user?.vipExpiresAt && (
                  <Link
                    to="/vip"
                    className="navbar-mobile-link bg-linear-to-r from-yellow-400 to-yellow-600 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="fas fa-crown"></i> VIP (
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(user.vipExpiresAt) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}{" "}
                    ngày)
                  </Link>
                )}
                {!(
                  user?.isVip ||
                  user?.role === "admin" ||
                  user?.role === "manager"
                ) && (
                  <Link
                    to="/vip"
                    className="navbar-mobile-link bg-linear-to-r from-yellow-400 to-yellow-600 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="fas fa-crown"></i> Nâng cấp VIP
                  </Link>
                )}
                {(user?.isVip ||
                  user?.role === "admin" ||
                  user?.role === "manager") && (
                  <Link
                    to="/theme-settings"
                    className="navbar-mobile-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="fas fa-palette"></i> Cài đặt giao diện
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="navbar-mobile-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="fas fa-tachometer-alt"></i> Dashboard
                  </Link>
                )}
                {user?.role === "manager" && (
                  <Link
                    to="/manager/dashboard"
                    className="navbar-mobile-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="fas fa-user-tie"></i> Dashboard
                  </Link>
                )}
                <Link
                  to={`/profile/${user?._id}`}
                  className="navbar-mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-circle"></i> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar-mobile-link w-full text-left hover:bg-red-600"
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar-mobile-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link
                  to="/register"
                  className="navbar-mobile-link bg-white text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-plus"></i> Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
