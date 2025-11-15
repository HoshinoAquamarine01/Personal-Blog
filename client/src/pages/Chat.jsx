import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";

const Chat = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReceiver();
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchReceiver = async () => {
    try {
      const res = await api.get(`/users/${userId}`);
      setReceiver(res.data.user || res.data);
    } catch (error) {
      console.error("Error fetching receiver:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/history/${userId}`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !selectedFile) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("receiverId", userId);
      formData.append("message", newMessage);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await api.post("/chat/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages([...messages, res.data.message]);
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error.response?.data?.error || "Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File không được lớn hơn 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-lg">
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center gap-4 shadow-md">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <img
            src={receiver?.avatar || "https://via.placeholder.com/40"}
            alt={receiver?.username}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{receiver?.username}</h3>
            <p className="text-sm text-blue-100">{receiver?.email}</p>
          </div>
          <button
            onClick={() => navigate(`/profile/${userId}`)}
            className="text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-user mr-2"></i>
            Xem hồ sơ
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <i className="fas fa-comments fa-3x mb-4 text-gray-300"></i>
              <p>Chưa có tin nhắn nào</p>
              <p className="text-sm">Gửi tin nhắn để bắt đầu trò chuyện</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSender = msg.sender._id === currentUser._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      isSender
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {!isSender && (
                      <p className="text-xs text-gray-500 mb-1">
                        {msg.sender.username}
                      </p>
                    )}
                    <p className="break-words">{msg.message}</p>
                    {msg.fileUrl && (
                      <div className="mt-2">
                        {msg.fileType?.startsWith("image/") ? (
                          <img
                            src={msg.fileUrl}
                            alt="attachment"
                            className="max-w-xs rounded-lg"
                          />
                        ) : (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm underline"
                          >
                            <i className="fas fa-file"></i>
                            Tải file
                          </a>
                        )}
                      </div>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        isSender ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
              <i className="fas fa-file text-blue-600"></i>
              <span className="text-sm text-gray-700 flex-1">
                {selectedFile.name}
              </span>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Đính kèm file"
            >
              <i className="fas fa-paperclip"></i>
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && !selectedFile)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
