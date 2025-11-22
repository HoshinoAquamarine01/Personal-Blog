import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
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
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
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
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          <i className="fas fa-bell text-blue-600 mr-2"></i>
          Thông báo
        </h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
            <i className="fas fa-check-double mr-2"></i>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-20">
          <i className="fas fa-bell-slash fa-3x text-gray-300 mb-4"></i>
          <p className="text-gray-500">Chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`card cursor-pointer transition-all ${
                notif.isRead
                  ? "bg-white"
                  : "bg-blue-50 border-l-4 border-blue-600"
              }`}
              onClick={() => {
                handleMarkAsRead(notif._id);
                if (notif.link) navigate(notif.link);
              }}
            >
              <div className="flex items-start gap-4">
                {notif.fromUser?.avatar && (
                  <img
                    src={notif.fromUser.avatar}
                    alt={notif.fromUser.username}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{notif.title}</h3>
                  <p className="text-gray-600 text-sm">{notif.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(notif.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {!notif.isRead && (
                  <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
