import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ThemeSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState(user?.theme || "light");
  const [loading, setLoading] = useState(false);

  const hasAccess = user?.isVip || user?.role === "admin" || user?.role === "manager";

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch("/vip/theme", { theme: selectedTheme });
      updateUser({ ...user, theme: selectedTheme });
      alert("✅ Đã lưu cài đặt giao diện!");
      navigate(-1);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi cập nhật theme");
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="card text-center">
            <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Tính năng VIP
            </h2>
            <p className="text-gray-600 mb-6">
              Nâng cấp VIP để sử dụng tính năng tùy chỉnh giao diện
            </p>
            <button
              onClick={() => navigate("/vip")}
              className="btn btn-primary"
            >
              <i className="fas fa-crown mr-2"></i>Nâng cấp VIP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            <i className="fas fa-palette text-primary mr-3"></i>
            Cài đặt giao diện
          </h1>
          <p className="text-gray-600">Tùy chỉnh giao diện theo sở thích của bạn</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Chọn chế độ hiển thị
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div
              onClick={() => setSelectedTheme("light")}
              className={`cursor-pointer border-4 rounded-xl p-6 transition-all ${
                selectedTheme === "light"
                  ? "border-blue-500 shadow-xl"
                  : "border-gray-200 hover:shadow-lg"
              }`}
            >
              <div className="bg-white rounded-lg p-6 mb-4 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
              <div className="text-center">
                <i className="fas fa-sun text-4xl text-yellow-500 mb-2"></i>
                <h3 className="text-xl font-bold">Chế độ sáng</h3>
                <p className="text-sm text-gray-600">Giao diện sáng, dễ nhìn ban ngày</p>
              </div>
            </div>

            <div
              onClick={() => setSelectedTheme("dark")}
              className={`cursor-pointer border-4 rounded-xl p-6 transition-all ${
                selectedTheme === "dark"
                  ? "border-purple-500 shadow-xl"
                  : "border-gray-200 hover:shadow-lg"
              }`}
            >
              <div className="bg-gray-900 rounded-lg p-6 mb-4 border-2 border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded"></div>
                  <div className="flex-1 h-4 bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
              <div className="text-center">
                <i className="fas fa-moon text-4xl text-purple-500 mb-2"></i>
                <h3 className="text-xl font-bold">Chế độ tối</h3>
                <p className="text-sm text-gray-600">Giảm mỏi mắt khi dùng ban đêm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            <i className="fas fa-times mr-2"></i>Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>Lưu cài đặt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
