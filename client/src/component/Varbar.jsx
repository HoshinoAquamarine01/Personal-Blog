import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Post from '../model/Post.js'; 
import { useAuth } from "../context/Authcontext";
import "../style/Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [authState, setAuthState] = useState(isAuthenticated);

  useEffect(() => {
    setAuthState(isAuthenticated);
  }, [isAuthenticated, user]);

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
    <nav className="navbar">
      <div className="container navbar-content">
        {/* Logo - Bên trái */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <i className="fas fa-blog"></i> My Blog
        </Link>

        <button
          className={`navbar-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navbar Links - Bên phải */}
        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          {/* Section 1: Home */}
          <div className="navbar-section home-section">
            <Link to="/" onClick={closeMenu}>
              <i className="fas fa-home"></i> Home
            </Link>
          </div>

          {/* Section 2: Auth Links hoặc Profile */}
          <div className="navbar-section auth-section">
            {!authState ? (
              <>
                <Link to="/login" onClick={closeMenu} className="btn-login">
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="btn-register"
                >
                  <i className="fas fa-user-plus"></i> Register
                </Link>
              </>
            ) : (
              <>
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMenu}
                    className="btn-dashboard"
                  >
                    <i className="fas fa-tachometer-alt"></i> Dashboard
                  </Link>
                )}

                {/* Profile Dropdown */}
                {user?._id && (
                  <div className="profile-dropdown-container">
                    <button
                      className="profile-avatar-btn"
                      onClick={toggleProfileDropdown}
                      title={user?.username || user?.email}
                    >
                      <img
                        src={
                          user?.avatar ||
                          "https://via.placeholder.com/40?text=Avatar"
                        }
                        alt="Avatar"
                        className="avatar-small"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/40?text=Avatar")
                        }
                      />
                      <i className="fas fa-chevron-down"></i>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdown && (
                      <div className="profile-dropdown-menu">
                        {/* User Info Header */}
                        <div className="profile-header">
                          <img
                            src={
                              user?.avatar ||
                              "https://via.placeholder.com/60?text=Avatar"
                            }
                            alt="Avatar"
                            className="avatar-large"
                          />
                          <div className="user-info">
                            <h4>{user?.username || user?.email}</h4>
                            <p className="email">{user?.email}</p>
                            <span className={`role-badge role-${user?.role}`}>
                              {user?.role === "admin" ? "👑 Admin" : "👤 User"}
                            </span>
                          </div>
                        </div>

                        <hr className="dropdown-divider" />

                        {/* Menu Items */}
                        <div className="dropdown-items">
                          <Link
                            to={`/profile/${user?._id}`}
                            className="dropdown-item"
                            onClick={closeProfileDropdown}
                          >
                            <i className="fas fa-user-circle"></i>
                            <span>View Profile</span>
                          </Link>

                          <Link
                            to={`/profile/${user?._id}`}
                            className="dropdown-item"
                            onClick={closeProfileDropdown}
                          >
                            <i className="fas fa-edit"></i>
                            <span>Edit Profile</span>
                          </Link>

                          {user?.role === "admin" && (
                            <Link
                              to="/admin/dashboard"
                              className="dropdown-item"
                              onClick={closeProfileDropdown}
                            >
                              <i className="fas fa-tachometer-alt"></i>
                              <span>Dashboard</span>
                            </Link>
                          )}

                          <button
                            className="dropdown-item logout-item"
                            onClick={() => {
                              handleLogout();
                              closeProfileDropdown();
                            }}
                          >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside để close dropdown */}
      {isProfileDropdown && (
        <div
          className="overlay"
          onClick={() => setIsProfileDropdown(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
