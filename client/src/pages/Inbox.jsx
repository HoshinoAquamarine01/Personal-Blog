import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";

const Inbox = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/chat/conversations");
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now - msgDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return msgDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Hôm qua";
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return msgDate.toLocaleDateString("vi-VN");
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Tin nhắn</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <i className="fas fa-inbox fa-3x mb-4 text-gray-300"></i>
            <p>Chưa có tin nhắn nào</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conv) => (
              <div
                key={conv.user._id}
                onClick={() => navigate(`/chat/${conv.user._id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-4"
              >
                <img
                  src={conv.user.avatar || "https://via.placeholder.com/50"}
                  alt={conv.user.username}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900">
                      {conv.user.username}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage.sender === currentUser._id && "Bạn: "}
                    {conv.lastMessage.message || "Đã gửi file"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
