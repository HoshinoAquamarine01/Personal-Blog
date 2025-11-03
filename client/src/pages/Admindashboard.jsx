import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../style/AdminDashboard.css";

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("📊 Fetching dashboard data...");

      const postsRes = await api.get("/posts").catch((err) => {
        console.error("Posts error:", err);
        return { data: [] };
      });

      const usersRes = await api.get("/users").catch((err) => {
        console.error("Users error:", err);
        return { data: [] };
      });

      console.log("✅ Posts loaded:", postsRes.data?.length || 0);
      console.log("✅ Users loaded:", usersRes.data?.length || 0);

      setPosts(postsRes.data || []);
      setUsers(usersRes.data || []);

      const totalViews = (postsRes.data || []).reduce(
        (sum, post) => sum + (post.views || 0),
        0
      );
      setStats({
        totalPosts: postsRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalViews,
      });
    } catch (err) {
      console.error("❌ Dashboard error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
      alert("Post deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-title">
          <i className="fas fa-tachometer-alt"></i>
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-user-info">
          <span>Welcome, {user?.username}!</span>
          <button onClick={handleLogout} className="btn-logout">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      <div className="admin-nav">
        <button
          className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <i className="fas fa-chart-line"></i> Overview
        </button>
        <button
          className={`nav-item ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <i className="fas fa-file-alt"></i> Posts ({stats.totalPosts})
        </button>
        <button
          className={`nav-item ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <i className="fas fa-users"></i> Users ({stats.totalUsers})
        </button>
        <button
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <i className="fas fa-cog"></i> Settings
        </button>
      </div>

      <div className="admin-content">
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="tab-content">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon posts">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Posts</h3>
                  <p className="stat-number">{stats.totalPosts}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon users">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon views">
                  <i className="fas fa-eye"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Views</h3>
                  <p className="stat-number">{stats.totalViews}</p>
                </div>
              </div>
            </div>

            <div className="recent-section">
              <h3>Recent Posts</h3>
              {posts.length === 0 ? (
                <p className="no-data">No posts yet</p>
              ) : (
                <div className="recent-list">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post._id} className="recent-item">
                      <div className="recent-info">
                        <h4>{post.title}</h4>
                        <p>
                          {post.author?.username || "Unknown"} •{" "}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="recent-stats">
                        <span>
                          <i className="fas fa-eye"></i> {post.views || 0}
                        </span>
                        <span>
                          <i className="fas fa-heart"></i> {post.likes || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Manage Posts</h2>
              <button
                onClick={() => navigate("/create-post")}
                className="btn btn-primary"
              >
                <i className="fas fa-plus"></i> New Post
              </button>
            </div>

            {posts.length === 0 ? (
              <p className="no-data">No posts found</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post._id}>
                        <td className="title-cell">
                          <strong>{post.title}</strong>
                        </td>
                        <td>{post.author?.username || "Unknown"}</td>
                        <td>
                          <span className="badge">{post.category}</span>
                        </td>
                        <td>{post.views || 0}</td>
                        <td>{post.likes || 0}</td>
                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                        <td className="actions-cell">
                          <button
                            onClick={() => navigate(`/posts/${post._id}`)}
                            className="btn-action view"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => navigate(`/edit-post/${post._id}`)}
                            className="btn-action edit"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="btn-action delete"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="tab-content">
            <h2>Manage Users</h2>
            {users.length === 0 ? (
              <p className="no-data">No users found</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <strong>{u.username}</strong>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span
                            className={`badge ${
                              u.role === "admin" ? "admin" : "user"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="actions-cell">
                          <button
                            onClick={() => navigate(`/profile/${u._id}`)}
                            className="btn-action view"
                            title="View Profile"
                          >
                            <i className="fas fa-user"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="tab-content">
            <h2>Settings</h2>
            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="setting-info">
                  <h3>Email Configuration</h3>
                  <p>Configure email settings for password reset</p>
                  <button
                    onClick={() => navigate("/admin/email-settings")}
                    className="btn btn-primary"
                  >
                    <i className="fas fa-cog"></i> Configure Email
                  </button>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-icon">
                  <i className="fas fa-redo"></i>
                </div>
                <div className="setting-info">
                  <h3>Refresh Data</h3>
                  <p>Reload dashboard data from server</p>
                  <button
                    onClick={fetchDashboardData}
                    className="btn btn-secondary"
                  >
                    <i className="fas fa-sync"></i> Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
