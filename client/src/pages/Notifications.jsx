import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleToggleSave = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/save`);
      setNotifications(
        notifications.map((n) =>
          n._id === id ? { ...n, saved: res.data.notification.saved } : n
        )
      );
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "message":
        return "fa-comment";
      case "post":
        return "fa-file-alt";
      case "comment":
        return "fa-comments";
      case "follow":
        return "fa-user-plus";
      default:
        return "fa-bell";
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "saved") return n.saved;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded ${
                filter === "unread" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Chưa đọc
            </button>
            <button
              onClick={() => setFilter("saved")}
              className={`px-3 py-1 rounded ${
                filter === "saved" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Đã lưu
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <i className="fas fa-bell-slash fa-3x mb-4 text-gray-300"></i>
            <p>Không có thông báo</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      notification.sender?.avatar ||
                      "https://via.placeholder.com/40"
                    }
                    alt={notification.sender?.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center gap-2">
                      <i
                        className={`fas ${getIcon(notification.type)} text-blue-600`}
                      ></i>
                      <p className="text-sm text-gray-800">
                        {notification.content}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleSave(notification._id)}
                      className={`p-2 rounded hover:bg-gray-200 ${
                        notification.saved ? "text-yellow-600" : "text-gray-400"
                      }`}
                      title={notification.saved ? "Bỏ lưu" : "Lưu"}
                    >
                      <i
                        className={`fas fa-bookmark ${
                          notification.saved ? "" : "far"
                        }`}
                      ></i>
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 rounded hover:bg-red-100 text-red-600"
                      title="Xóa"
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
    </div>
  );
};

export default Notifications;
