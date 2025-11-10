import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

      const postsRes = await api.get("/posts").catch(() => ({ data: [] }));
      const usersRes = await api.get("/users").catch(() => ({ data: [] }));

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
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm("Ban this user?")) return;
    try {
      await api.patch(`/users/${userId}/ban`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm("Unban this user?")) return;
    try {
      await api.patch(`/users/${userId}/unban`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to unban user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-dashboard animate-fadeIn">
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Chart data
  const chartData = posts.slice(0, 10).map((post) => ({
    name: post.title.substring(0, 15),
    views: post.views || 0,
    likes: post.likes || 0,
  }));

  return (
    <div className="admin-dashboard bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center animate-slideUp">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            <i className="fas fa-tachometer-alt text-primary mr-3"></i>Admin
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back,{" "}
            <span className="text-primary font-bold">{user?.username}</span>!
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-primary hover:shadow-xl"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slideUp">
        <div className="card hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
              <i className="fas fa-file-alt text-2xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Posts</p>
              <p className="text-4xl font-bold text-slate-800">
                {stats.totalPosts}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500">
              <i className="fas fa-users text-2xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold text-slate-800">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
              <i className="fas fa-eye text-2xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Views</p>
              <p className="text-4xl font-bold text-slate-800">
                {stats.totalViews}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 bg-white p-4 rounded-lg shadow-md flex-wrap animate-slideUp">
        {["overview", "posts", "users", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? "bg-gradient-primary text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <i
              className={`fas fa-${
                tab === "overview"
                  ? "chart-line"
                  : tab === "posts"
                  ? "file-alt"
                  : tab === "users"
                  ? "users"
                  : "cog"
              } mr-2`}
            ></i>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 animate-slideUp">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3 animate-slideUp">
            <i className="fas fa-exclamation-circle text-red-500 text-xl mt-0.5"></i>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-chart-bar text-primary mr-2"></i>Analytics
              Overview
            </h2>

            {/* Chart */}
            <div className="card border border-gray-200">
              <h3 className="text-lg font-bold mb-4">📊 Posts Performance</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" />
                    <Bar dataKey="likes" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No data available
                </p>
              )}
            </div>

            {/* Recent Posts */}
            <div className="card border border-gray-200">
              <h3 className="text-lg font-bold mb-4">
                <i className="fas fa-history text-primary mr-2"></i>Recent Posts
              </h3>
              {posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.slice(0, 5).map((post) => (
                    <div
                      key={post._id}
                      className="flex justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors animate-slideUp"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <i className="fas fa-user text-primary mr-1"></i>
                          {post.author?.username} •
                          <i className="fas fa-calendar text-primary mr-1 ml-2"></i>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-6 text-sm ml-4">
                        <span className="text-blue-600 font-semibold">
                          <i className="fas fa-eye mr-1"></i>
                          {post.views || 0}
                        </span>
                        <span className="text-red-600 font-semibold">
                          <i className="fas fa-heart mr-1"></i>
                          {post.likes || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No posts available
                </p>
              )}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                <i className="fas fa-file-alt text-primary mr-2"></i>Manage
                Posts
              </h2>
              <button
                onClick={() => navigate("/create-post")}
                className="btn btn-primary"
              >
                <i className="fas fa-plus mr-2"></i> New Post
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
                <p className="text-lg">No posts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-800">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-800">
                        Author
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-800">
                        Views
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-800">
                        Likes
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-800">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr
                        key={post._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 truncate max-w-xs text-gray-800">
                          {post.title}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {post.author?.username}
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-600">
                          {post.views || 0}
                        </td>
                        <td className="px-4 py-3 font-semibold text-red-600">
                          {post.likes || 0}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
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
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-users text-primary mr-2"></i>Manage Users
            </h2>
            {users.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <i className="fas fa-user-slash text-6xl text-gray-300 mb-4 block"></i>
                <p className="text-lg">No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="card border border-gray-200 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">
                          {u.username}
                        </h4>
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </div>
                      <span
                        className={`badge text-xs ${
                          u.role === "admin"
                            ? "bg-yellow-300 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {u.role === "admin" ? "👑 Admin" : "User"}
                      </span>
                    </div>
                    <p className="text-sm mb-4">
                      Status:{" "}
                      <span
                        className={`font-semibold ${
                          u.isBanned ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {u.isBanned ? "🚫 Banned" : "✅ Active"}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      {u.isBanned ? (
                        <button
                          onClick={() => handleUnbanUser(u._id)}
                          className="flex-1 btn btn-primary text-sm py-2"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanUser(u._id)}
                          className="flex-1 btn btn-danger text-sm py-2"
                        >
                          Ban
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="flex-1 btn btn-danger text-sm py-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-cog text-primary mr-2"></i>Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card border border-gray-200 hover:shadow-lg">
                <div className="text-4xl text-primary mb-3">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  Email Configuration
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Setup email for password reset
                </p>
                <button
                  onClick={() => navigate("/admin/email-settings")}
                  className="btn btn-primary w-full"
                >
                  <i className="fas fa-cog mr-2"></i>Configure
                </button>
              </div>

              <div className="card border border-gray-200 hover:shadow-lg">
                <div className="text-4xl text-primary mb-3">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  Refresh Data
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Reload all dashboard data
                </p>
                <button
                  onClick={fetchDashboardData}
                  className="btn btn-secondary w-full"
                >
                  <i className="fas fa-sync mr-2"></i>Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
