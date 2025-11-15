import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";

const EditProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    // Kiểm tra quyền chỉnh sửa
    if (currentUser?._id !== userId) {
      setError("Bạn chỉ có thể chỉnh sửa hồ sơ của chính mình");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    fetchUserData();
  }, [userId, currentUser, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${userId}`);
      const userData = res.data.user || res.data;

      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        bio: userData.bio || "",
        phone: userData.phone || "",
        location: userData.location || "",
        website: userData.website || "",
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.put(`/users/${userId}`, formData);
      setSuccess("Cập nhật hồ sơ thành công!");
      setTimeout(() => navigate(`/profile/${userId}`), 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container profile-page py-10">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">
            <i className="fas fa-user-edit text-blue-600 mr-2"></i>
            Chỉnh sửa hồ sơ
          </h1>

          {error && (
            <div className="alert alert-error mb-4">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <i className="fas fa-check-circle"></i> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                <i className="fas fa-user mr-2"></i>Tên người dùng
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                <i className="fas fa-envelope mr-2"></i>Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                <i className="fas fa-quote-left mr-2"></i>Tiểu sử
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-control"
                rows="4"
                placeholder="Giới thiệu về bạn..."
              ></textarea>
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                <i className="fas fa-phone mr-2"></i>Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="0123456789"
              />
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                <i className="fas fa-map-marker-alt mr-2"></i>Địa chỉ
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-control"
                placeholder="Hà Nội, Việt Nam"
              />
            </div>

            {/* Website */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                <i className="fas fa-globe mr-2"></i>Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="form-control"
                placeholder="https://example.com"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={saving}
              >
                <i className="fas fa-save"></i>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/profile/${userId}`)}
                className="btn btn-secondary flex-1"
                disabled={saving}
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
