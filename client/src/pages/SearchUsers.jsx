import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const SearchUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [searchType, setSearchType] = useState(""); // "exact" or "similar"

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setError("Vui lòng nhập username");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      setError("");

      console.log("Searching for:", searchTerm); // Debug

      const res = await api.get(
        `/users/search?username=${encodeURIComponent(searchTerm)}`
      );

      console.log("Response:", res.data); // Debug

      setUsers(res.data.users || []);
      setSearchType(
        res.data.isExact ? "exact" : res.data.isSimilar ? "similar" : ""
      );
    } catch (error) {
      console.error("Error searching users:", error);
      setError(error.response?.data?.error || "Lỗi khi tìm kiếm");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">
            <i className="fas fa-search text-blue-600 mr-2"></i>
            Tìm kiếm người dùng
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setError("");
                  }}
                  placeholder="Nhập username cần tìm..."
                  className="form-control pl-12"
                />
                <i className="fas fa-search absolute left-4 top-4 text-gray-400"></i>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !searchTerm.trim()}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Đang tìm...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i> Tìm kiếm
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {/* Users List */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="spinner"></div>
            </div>
          ) : searched && users.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
              <i className="fas fa-user-slash fa-3x mb-4 text-gray-400"></i>
              <p className="text-lg font-medium">
                Không tìm thấy người dùng "{searchTerm}"
              </p>
              <p className="text-sm mt-2">
                Username không tồn tại trong hệ thống
              </p>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {searchType === "exact" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <i className="fas fa-check-circle"></i>
                    Tìm thấy kết quả chính xác với username "{searchTerm}"
                  </p>
                </div>
              )}
              {searchType === "similar" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <i className="fas fa-info-circle"></i>
                    Không tìm thấy "{searchTerm}" chính xác. Dưới đây là các kết
                    quả tương tự:
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600">
                Tìm thấy {users.length} kết quả
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          user.avatar ||
                          "https://via.placeholder.com/80?text=Avatar"
                        }
                        alt={user.username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.bio && (
                          <p className="text-sm text-gray-500 italic mt-1">
                            {user.bio.substring(0, 50)}
                            {user.bio.length > 50 ? "..." : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/profile/${user._id}`)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <i className="fas fa-user"></i>
                          Xem
                        </button>
                        <button
                          onClick={() => handleChatClick(user._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <i className="fas fa-comment"></i>
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <i className="fas fa-search fa-3x mb-4"></i>
              <p>Nhập username để bắt đầu tìm kiếm</p>
              <p className="text-sm mt-2">Ví dụ: john_doe, admin, user123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
