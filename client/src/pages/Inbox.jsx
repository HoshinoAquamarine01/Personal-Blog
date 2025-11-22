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
      const res = await api.get("/chat/conversations");
      console.log("Conversations:", res.data);
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
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <i className="fas fa-inbox text-blue-600"></i>
          Tin nhắn
        </h1>

        {conversations.length === 0 ? (
          <div className="card text-center py-20">
            <i className="fas fa-comment-slash fa-4x text-gray-300 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Chưa có tin nhắn nào
            </h3>
            <p className="text-gray-500 mb-4">
              Hãy bắt đầu trò chuyện với ai đó!
            </p>
            <button
              onClick={() => navigate("/search-users")}
              className="btn btn-primary"
            >
              <i className="fas fa-search mr-2"></i>
              Tìm người dùng
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div
                key={conv._id?._id}
                onClick={() => navigate(`/chat/${conv._id?._id}`)}
                className={`card cursor-pointer transition-all hover:shadow-lg ${
                  conv.unreadCount > 0
                    ? "border-l-4 border-blue-600 bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={conv._id?.avatar || "https://via.placeholder.com/50"}
                      alt={conv._id?.username}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {conv._id?.username || "User"}
                    </h3>
                    <p className="text-gray-600 text-sm truncate">
                      {conv.fileUrl ? (
                        <>
                          <i className="fas fa-paperclip mr-1"></i>
                          Đã gửi file
                        </>
                      ) : (
                        conv.lastMessage || "Chưa có tin nhắn"
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-gray-400 block mb-1">
                      {new Date(conv.lastMessageTime).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                        }
                      )}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(conv.lastMessageTime).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
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

export default Inbox;
