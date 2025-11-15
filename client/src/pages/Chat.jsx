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
      clearFileInput();
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
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  const clearFileInput = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (fileType, isSender) => {
    const senderBg = 'bg-slate-700/30';
    const receiverBgs = {
      pdf: 'bg-red-100/50',
      word: 'bg-blue-100/50',
      excel: 'bg-green-100/50',
      powerpoint: 'bg-orange-100/50',
      text: 'bg-gray-100/50',
      default: 'bg-gray-100/50'
    };

    if (fileType?.includes('pdf')) return { icon: 'fa-file-pdf', color: isSender ? 'text-red-200' : 'text-red-600', bg: isSender ? senderBg : receiverBgs.pdf };
    if (fileType?.includes('word') || fileType?.includes('document')) return { icon: 'fa-file-word', color: isSender ? 'text-blue-200' : 'text-blue-600', bg: isSender ? senderBg : receiverBgs.word };
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return { icon: 'fa-file-excel', color: isSender ? 'text-green-200' : 'text-green-600', bg: isSender ? senderBg : receiverBgs.excel };
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return { icon: 'fa-file-powerpoint', color: isSender ? 'text-orange-200' : 'text-orange-600', bg: isSender ? senderBg : receiverBgs.powerpoint };
    if (fileType?.includes('text')) return { icon: 'fa-file-alt', color: isSender ? 'text-gray-200' : 'text-gray-600', bg: isSender ? senderBg : receiverBgs.text };
    return { icon: 'fa-file', color: isSender ? 'text-gray-200' : 'text-gray-600', bg: isSender ? senderBg : receiverBgs.default };
  };

  const getFileName = (fileUrl) => {
    if (!fileUrl) return 'File';
    const parts = fileUrl.split('/');
    return parts[parts.length - 1];
  };

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${fileUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-lg">
        {/* Chat Header */}
        <div className="bg-linear-to-r from-slate-700 to-slate-600 text-white p-4 flex items-center gap-4 shadow-md">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-slate-800 p-2 rounded-lg transition-colors"
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
            <p className="text-sm text-slate-200">{receiver?.email}</p>
          </div>
          <button
            onClick={() => navigate(`/profile/${userId}`)}
            className="text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-user mr-2"></i>
            Xem hồ sơ
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-slate-50 to-gray-100">
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
                    className={`max-w-md px-4 py-2 rounded-lg shadow-sm ${
                      isSender
                        ? "bg-linear-to-r from-slate-600 to-slate-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {!isSender && (
                      <p className="text-xs text-gray-500 mb-1">
                        {msg.sender.username}
                      </p>
                    )}
                    <p className="wrap-break-words">{msg.message}</p>
                    {msg.fileUrl && (
                      <div className="mt-2">
                        {msg.fileType?.startsWith("image/") ? (
                          <a href={getFileUrl(msg.fileUrl)} target="_blank" rel="noopener noreferrer">
                            <img
                              src={getFileUrl(msg.fileUrl)}
                              alt="attachment"
                              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          </a>
                        ) : (
                          <a
                            href={getFileUrl(msg.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 p-3 rounded-lg ${getFileIcon(msg.fileType, isSender).bg} hover:opacity-80 transition-opacity`}
                          >
                            <i className={`fas ${getFileIcon(msg.fileType, isSender).icon} text-2xl ${getFileIcon(msg.fileType, isSender).color}`}></i>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isSender ? 'text-white' : 'text-gray-800'}`}>
                                {getFileName(msg.fileUrl)}
                              </p>
                              <p className={`text-xs ${isSender ? 'text-slate-200' : 'text-gray-500'}`}>
                                Nhấn để mở
                              </p>
                            </div>
                            <i className={`fas fa-external-link-alt ${isSender ? 'text-slate-200' : 'text-gray-400'}`}></i>
                          </a>
                        )}
                      </div>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        isSender ? "text-slate-200" : "text-gray-400"
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
            <div className="mb-2 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <i className="fas fa-file text-slate-600"></i>
              <span className="text-sm text-gray-700 flex-1">
                {selectedFile.name}
              </span>
              <button
                onClick={clearFileInput}
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && !selectedFile)}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
