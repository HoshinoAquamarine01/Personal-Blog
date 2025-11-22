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
  const [quests, setQuests] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    pendingPosts: 0,
  });
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questForm, setQuestForm] = useState({
    title: "",
    description: "",
    requirement: 1,
    reward: 10,
    icon: "fa-tasks",
  });
  const [shopForm, setShopForm] = useState({
    name: "",
    description: "",
    price: 10,
    effectId: "",
    effectType: "avatar",
    icon: "fa-star",
  });
  const [editingQuest, setEditingQuest] = useState(null);
  const [editingShop, setEditingShop] = useState(null);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [coinAction, setCoinAction] = useState("add");

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
      const pendingRes = await api
        .get("/posts/pending")
        .catch(() => ({ data: [] }));
      const questsRes = await api.get("/quests").catch(() => ({ data: [] }));
      const shopRes = await api.get("/shop").catch(() => ({ data: [] }));

      setPosts(postsRes.data || []);
      setUsers(usersRes.data || []);
      setPendingPosts(pendingRes.data || []);
      setQuests(questsRes.data || []);
      setShopItems(shopRes.data || []);

      const totalViews = (postsRes.data || []).reduce(
        (sum, post) => sum + (post.views || 0),
        0
      );
      setStats({
        totalPosts: postsRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalViews,
        pendingPosts: pendingRes.data?.length || 0,
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

  const handleApprovePost = async (postId) => {
    try {
      await api.patch(`/posts/${postId}/approve`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to approve post");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleManageCoins = (user) => {
    setSelectedUser(user);
    setShowCoinModal(true);
  };

  const handleUpdateCoins = async (e) => {
    e.preventDefault();

    if (!coinAmount || isNaN(coinAmount)) {
      alert("Vui lòng nhập số coin hợp lệ");
      return;
    }

    try {
      const res = await api.put(`/admin/users/${selectedUser._id}/coins`, {
        coins: parseInt(coinAmount),
        action: coinAction,
      });

      alert(res.data.message);
      setShowCoinModal(false);
      setCoinAmount("");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.error || "Không thể cập nhật coin");
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slideUp">
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

        <div className="card hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-500">
              <i className="fas fa-clock text-2xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Posts</p>
              <p className="text-4xl font-bold text-slate-800">
                {stats.pendingPosts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 bg-white p-4 rounded-lg shadow-md flex-wrap animate-slideUp">
        {[
          "overview",
          "posts",
          "pending",
          "users",
          "quests",
          "shop",
          "coins",
          "settings",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? "bg-slate-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <i
              className={`fas fa-${
                tab === "overview"
                  ? "chart-line"
                  : tab === "posts"
                  ? "file-alt"
                  : tab === "pending"
                  ? "clock"
                  : tab === "users"
                  ? "users"
                  : tab === "quests"
                  ? "tasks"
                  : tab === "shop"
                  ? "store"
                  : tab === "coins"
                  ? "coins"
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
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            <i className="fas fa-user mr-1 text-primary"></i>
                            {post.author?.username}
                          </span>
                          <span className="font-semibold text-blue-600">
                            <i className="fas fa-eye mr-1"></i>
                            {post.views || 0}
                          </span>
                          <span className="font-semibold text-red-600">
                            <i className="fas fa-heart mr-1"></i>
                            {post.likes || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/posts/${post._id}`)}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => navigate(`/edit-post/${post._id}`)}
                          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === "pending" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-clock text-primary mr-2"></i>Pending Posts
            </h2>
            {pendingPosts.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <i className="fas fa-check-circle text-6xl text-gray-300 mb-4 block"></i>
                <p className="text-lg">No pending posts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map((post) => (
                  <div
                    key={post._id}
                    className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            <i className="fas fa-user mr-1 text-primary"></i>
                            {post.author?.username}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-semibold">
                            {post.author?.role === "manager"
                              ? "👔 Manager"
                              : "User"}
                          </span>
                          <span>
                            <i className="fas fa-calendar mr-1 text-primary"></i>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/posts/${post._id}`)}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handleApprovePost(post._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                        >
                          <i className="fas fa-check mr-2"></i>Approve
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg text-gray-800">
                            {u.username}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              u.role === "admin"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role === "admin" ? "👑 Admin" : "User"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              u.isBanned
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {u.isBanned ? "🚫 Banned" : "✅ Active"}
                          </span>
                        </div>
                        <p className="text-base text-gray-600">{u.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {u.isBanned ? (
                          <button
                            onClick={() => handleUnbanUser(u._id)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
                          >
                            <i className="fas fa-check mr-2"></i>Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(u._id)}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors font-medium"
                          >
                            <i className="fas fa-ban mr-2"></i>Ban
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
                        >
                          <i className="fas fa-trash mr-2"></i>Delete
                        </button>
                        <button
                          onClick={() => handleManageCoins(u)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                          title="Manage Coins"
                        >
                          <i className="fas fa-coins mr-2"></i>Coins
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quests Tab */}
        {activeTab === "quests" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-tasks text-primary mr-2"></i>Quản lý Nhiệm vụ
            </h2>

            <div className="card mb-6">
              <h3 className="text-lg font-bold mb-4">
                {editingQuest ? "Sửa" : "Thêm"} Nhiệm vụ
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={questForm.title}
                  onChange={(e) =>
                    setQuestForm({ ...questForm, title: e.target.value })
                  }
                  className="form-control"
                />
                <input
                  type="text"
                  placeholder="Mô tả"
                  value={questForm.description}
                  onChange={(e) =>
                    setQuestForm({ ...questForm, description: e.target.value })
                  }
                  className="form-control"
                />
                <input
                  type="number"
                  placeholder="Yêu cầu"
                  value={questForm.requirement}
                  onChange={(e) =>
                    setQuestForm({
                      ...questForm,
                      requirement: parseInt(e.target.value),
                    })
                  }
                  className="form-control"
                />
                <input
                  type="number"
                  placeholder="Phần thưởng (xu)"
                  value={questForm.reward}
                  onChange={(e) =>
                    setQuestForm({
                      ...questForm,
                      reward: parseInt(e.target.value),
                    })
                  }
                  className="form-control"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={async () => {
                    try {
                      if (editingQuest) {
                        await api.put(`/quests/${editingQuest}`, questForm);
                      } else {
                        await api.post("/quests", questForm);
                      }
                      setQuestForm({
                        title: "",
                        description: "",
                        requirement: 1,
                        reward: 10,
                        icon: "fa-tasks",
                      });
                      setEditingQuest(null);
                      fetchDashboardData();
                    } catch (err) {
                      alert(err.response?.data?.message || "Lỗi");
                    }
                  }}
                  className="btn btn-primary"
                >
                  <i className="fas fa-save mr-2"></i>
                  {editingQuest ? "Cập nhật" : "Thêm"}
                </button>
                {editingQuest && (
                  <button
                    onClick={() => {
                      setEditingQuest(null);
                      setQuestForm({
                        title: "",
                        description: "",
                        requirement: 1,
                        reward: 10,
                        icon: "fa-tasks",
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {quests.map((quest) => (
                <div
                  key={quest._id}
                  className="p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {quest.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{quest.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">
                          Yêu cầu: {quest.requirement}
                        </span>
                        <span className="text-yellow-600 font-semibold">
                          <i className="fas fa-coins mr-1"></i>
                          {quest.reward} xu
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingQuest(quest._id);
                          setQuestForm({
                            title: quest.title,
                            description: quest.description,
                            requirement: quest.requirement,
                            reward: quest.reward,
                            icon: quest.icon,
                          });
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm("Xóa nhiệm vụ?")) {
                            await api.delete(`/quests/${quest._id}`);
                            fetchDashboardData();
                          }
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === "shop" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-store text-primary mr-2"></i>Quản lý Cửa hàng
            </h2>

            <div className="card mb-6">
              <h3 className="text-lg font-bold mb-4">
                {editingShop ? "Sửa" : "Thêm"} Vật phẩm
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tên vật phẩm"
                  value={shopForm.name}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, name: e.target.value })
                  }
                  className="form-control"
                />
                <input
                  type="text"
                  placeholder="Mô tả"
                  value={shopForm.description}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, description: e.target.value })
                  }
                  className="form-control"
                />
                <input
                  type="number"
                  placeholder="Giá (xu)"
                  value={shopForm.price}
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      price: parseInt(e.target.value),
                    })
                  }
                  className="form-control"
                />
                <input
                  type="text"
                  placeholder="Effect ID (vd: sparkle-avatar)"
                  value={shopForm.effectId}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, effectId: e.target.value })
                  }
                  className="form-control"
                />
                <select
                  value={shopForm.effectType}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, effectType: e.target.value })
                  }
                  className="form-control"
                >
                  <option value="avatar">Avatar Effect</option>
                  <option value="badge">Badge</option>
                  <option value="theme">Theme</option>
                </select>
                <input
                  type="text"
                  placeholder="Icon (vd: fa-star)"
                  value={shopForm.icon}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, icon: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={async () => {
                    try {
                      if (editingShop) {
                        await api.put(`/shop/${editingShop}`, shopForm);
                      } else {
                        await api.post("/shop", shopForm);
                      }
                      setShopForm({
                        name: "",
                        description: "",
                        price: 10,
                        effectId: "",
                        effectType: "avatar",
                        icon: "fa-star",
                      });
                      setEditingShop(null);
                      fetchDashboardData();
                    } catch (err) {
                      alert(err.response?.data?.message || "Lỗi");
                    }
                  }}
                  className="btn btn-primary"
                >
                  <i className="fas fa-save mr-2"></i>
                  {editingShop ? "Cập nhật" : "Thêm"}
                </button>
                {editingShop && (
                  <button
                    onClick={() => {
                      setEditingShop(null);
                      setShopForm({
                        name: "",
                        description: "",
                        price: 10,
                        effectId: "",
                        effectType: "avatar",
                        icon: "fa-star",
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {shopItems.map((item) => (
                <div
                  key={item._id}
                  className="p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="text-center mb-3">
                    <i
                      className={`fas ${item.icon} text-4xl text-blue-600 mb-2`}
                    ></i>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold">
                      <i className="fas fa-coins"></i>
                      <span>{item.price} xu</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingShop(item._id);
                        setShopForm({
                          name: item.name,
                          description: item.description,
                          price: item.price,
                          effectId: item.effectId,
                          effectType: item.effectType,
                          icon: item.icon,
                        });
                      }}
                      className="btn bg-blue-500 text-white flex-1 hover:bg-blue-600"
                    >
                      <i className="fas fa-edit mr-2"></i>Sửa
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm("Xóa vật phẩm?")) {
                          await api.delete(`/shop/${item._id}`);
                          fetchDashboardData();
                        }
                      }}
                      className="btn bg-red-500 text-white flex-1 hover:bg-red-600"
                    >
                      <i className="fas fa-trash mr-2"></i>Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coins Tab */}
        {activeTab === "coins" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-coins text-primary mr-2"></i>Quản lý Xu
            </h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u._id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-blue-600"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{u.username}</h4>
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Xu hiện tại</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          <i className="fas fa-coins mr-1"></i>
                          {u.coins || 0}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const amount = prompt("Nhập số xu (+ hoặc -):");
                          if (amount) {
                            await api.patch(`/users/${u._id}`, {
                              coins: (u.coins || 0) + parseInt(amount),
                            });
                            fetchDashboardData();
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <i className="fas fa-edit mr-2"></i>Sửa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Coin Management Modal */}
      {showCoinModal && (
        <div className="modal-overlay" onClick={() => setShowCoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quản lý Coin - {selectedUser?.username}</h2>
            </div>
            <form onSubmit={handleUpdateCoins} className="modal-body">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Coin hiện tại: <strong>{selectedUser?.coins || 0} 💰</strong>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Hành động
                </label>
                <select
                  value={coinAction}
                  onChange={(e) => setCoinAction(e.target.value)}
                  className="form-control"
                >
                  <option value="add">Cộng thêm</option>
                  <option value="set">Đặt số coin</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Số coin {coinAction === "add" ? "(+/-)" : "(Set to)"}
                </label>
                <input
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  className="form-control"
                  placeholder={coinAction === "add" ? "+50 hoặc -50" : "100"}
                  required
                />
                {coinAction === "add" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nhập số âm để trừ coin (ví dụ: -50)
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCoinModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-check mr-2"></i>
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
