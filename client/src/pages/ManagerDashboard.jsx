import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [quests, setQuests] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalUsers: 0, pendingPosts: 0 });
  const [loading, setLoading] = useState(true);
  const [questForm, setQuestForm] = useState({ title: "", description: "", requirement: 1, reward: 10, icon: "fa-tasks" });
  const [shopForm, setShopForm] = useState({ name: "", description: "", price: 10, effectId: "", effectType: "avatar", icon: "fa-star" });
  const [editingQuest, setEditingQuest] = useState(null);
  const [editingShop, setEditingShop] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== "manager" && user.role !== "admin")) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, usersRes, questsRes, shopRes] = await Promise.all([
        api.get("/posts/my-posts").catch(() => ({ data: [] })),
        api.get("/users").catch(() => ({ data: [] })),
        api.get("/quests").catch(() => ({ data: [] })),
        api.get("/shop").catch(() => ({ data: [] })),
      ]);

      setPosts(postsRes.data || []);
      setUsers(usersRes.data || []);
      setQuests(questsRes.data || []);
      setShopItems(shopRes.data || []);
      
      const pendingPosts = (postsRes.data || []).filter(p => !p.isApproved);

      setStats({
        totalPosts: postsRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        pendingPosts: pendingPosts.length,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm("Ban this user?")) return;
    try {
      await api.patch(`/users/${userId}/ban`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm("Unban this user?")) return;
    try {
      await api.patch(`/users/${userId}/unban`);
      fetchData();
    } catch (err) {
      alert("Failed to unban user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }



  return (
    <div className="admin-dashboard bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            <i className="fas fa-user-tie text-primary mr-3"></i>Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, <span className="text-primary font-bold">{user?.username}</span>!
          </p>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} className="btn btn-primary">
          <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card hover:shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
              <i className="fas fa-file-alt text-2xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">My Posts</p>
              <p className="text-4xl font-bold text-slate-800">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
              <i className="fas fa-clock text-2xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Approval</p>
              <p className="text-4xl font-bold text-slate-800">{stats.pendingPosts}</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500">
              <i className="fas fa-users text-2xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold text-slate-800">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-white p-4 rounded-lg shadow-md flex-wrap">
        {["overview", "posts", "users", "quests", "shop", "coins"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === tab ? "bg-slate-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <i className={`fas fa-${
              tab === "overview" ? "chart-line" :
              tab === "posts" ? "file-alt" :
              tab === "users" ? "users" :
              tab === "quests" ? "tasks" :
              tab === "shop" ? "store" :
              "coins"
            } mr-2`}></i>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-chart-bar text-primary mr-2"></i>Overview
            </h2>
            <div className="space-y-3">
              {posts.slice(0, 5).map((post) => (
                <div key={post._id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">{post.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {post.isApproved ? (
                          <span className="text-green-600"><i className="fas fa-check-circle mr-1"></i>Approved</span>
                        ) : (
                          <span className="text-orange-600"><i className="fas fa-clock mr-1"></i>Pending Approval</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600 font-semibold text-sm">
                        <i className="fas fa-eye mr-1"></i>{post.views || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                <i className="fas fa-file-alt text-primary mr-2"></i>My Posts
              </h2>
              <button onClick={() => navigate("/create-post")} className="btn btn-primary">
                <i className="fas fa-plus mr-2"></i> New Post
              </button>
            </div>

            <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
              <p className="text-sm text-orange-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <strong>Note:</strong> Posts created by managers require admin approval before being published.
              </p>
            </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post._id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {post.isApproved ? (
                          <span className="text-green-600 font-semibold">
                            <i className="fas fa-check-circle mr-1"></i>Approved
                          </span>
                        ) : (
                          <span className="text-orange-600 font-semibold">
                            <i className="fas fa-clock mr-1"></i>Pending Approval
                          </span>
                        )}
                        <span className="font-semibold text-blue-600">
                          <i className="fas fa-eye mr-1"></i>{post.views || 0}
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
                        onClick={() => navigate(`/edit-post/${post._id}`)}
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <i className="fas fa-edit"></i>
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
          </div>
        )}

        {activeTab === "quests" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-tasks text-primary mr-2"></i>Quản lý Nhiệm vụ
            </h2>
            <div className="space-y-3">
              {quests.map((quest) => (
                <div key={quest._id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{quest.title}</h3>
                      <p className="text-gray-600 mb-2">{quest.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">Yêu cầu: {quest.requirement}</span>
                        <span className="text-yellow-600 font-semibold">
                          <i className="fas fa-coins mr-1"></i>{quest.reward} xu
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm("Xóa nhiệm vụ?")) {
                          await api.delete(`/quests/${quest._id}`);
                          fetchData();
                        }
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "shop" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-store text-primary mr-2"></i>Quản lý Cửa hàng
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {shopItems.map((item) => (
                <div key={item._id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-center mb-3">
                    <i className={`fas ${item.icon} text-4xl text-blue-600 mb-2`}></i>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold">
                      <i className="fas fa-coins"></i>
                      <span>{item.price} xu</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm("Xóa vật phẩm?")) {
                        await api.delete(`/shop/${item._id}`);
                        fetchData();
                      }
                    }}
                    className="btn bg-red-500 text-white w-full hover:bg-red-600"
                  >
                    <i className="fas fa-trash mr-2"></i>Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                          <i className="fas fa-coins mr-1"></i>{u.coins || 0}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const amount = prompt("Nhập số xu (+ hoặc -):");
                          if (amount) {
                            await api.patch(`/users/${u._id}`, { coins: (u.coins || 0) + parseInt(amount) });
                            fetchData();
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

        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              <i className="fas fa-users text-primary mr-2"></i>Manage Users
            </h2>
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-800">
                <i className="fas fa-info-circle mr-2"></i>
                Showing all users from database. You cannot ban or delete admin accounts.
              </p>
            </div>
            <div className="space-y-3">
              {users.map((u) => {
                const isAdmin = u.role === "admin";
                const isCurrentUser = u._id === user._id;
                return (
                  <div key={u._id} className={`p-4 rounded-lg border ${
                    isAdmin ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200"
                  }`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg text-gray-800">{u.username}</h4>
                          {isCurrentUser && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                              (You)
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            u.role === "admin" ? "bg-yellow-200 text-yellow-800" :
                            u.role === "manager" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {u.role === "admin" ? "👑 Admin" : u.role === "manager" ? "👔 Manager" : "User"}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            u.isBanned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}>
                            {u.isBanned ? "🚫 Banned" : "✅ Active"}
                          </span>
                        </div>
                        <p className="text-base text-gray-600">{u.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {isAdmin ? (
                          <div className="px-4 py-2 bg-gray-300 text-gray-600 rounded font-medium cursor-not-allowed">
                            <i className="fas fa-lock mr-2"></i>Protected
                          </div>
                        ) : (
                          <>
                            {u.isBanned ? (
                              <button
                                onClick={() => handleUnbanUser(u._id)}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                              >
                                <i className="fas fa-check mr-2"></i>Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(u._id)}
                                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium"
                              >
                                <i className="fas fa-ban mr-2"></i>Ban
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                            >
                              <i className="fas fa-trash mr-2"></i>Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
