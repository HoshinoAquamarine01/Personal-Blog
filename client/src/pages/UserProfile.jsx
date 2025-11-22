import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";
import { getImageUrl } from "../utils/imageHelper";
import ChangeAvatarModal from "../component/ChangeAvatarModal";
import ChangeCoverModal from "../component/ChangeCoverModal";

const Profile = () => {
  const { userId: urlUserId } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const profileId = urlUserId;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/users/${profileId}`);
        setUserProfile(res.data);

        const postsRes = await api.get(`/posts?author=${profileId}`);
        setUserPosts(postsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentUser || !profileId) return;

      try {
        const followRes = await api.get(`/users/${profileId}/is-following`);
        setIsFollowing(followRes.data.isFollowing);
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };

    checkFollowingStatus();
  }, [currentUser, profileId]);

  const handleAvatarChange = (newAvatarUrl) => {
    setUserProfile({ ...userProfile, avatar: newAvatarUrl });
    if (currentUser?._id === userProfile._id) {
      window.location.reload();
    }
  };

  const handleCoverChange = (newCoverUrl) => {
    setUserProfile({ ...userProfile, coverImage: newCoverUrl });
    if (currentUser?._id === userProfile._id) {
      window.location.reload();
    }
  };

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);

      if (isFollowing) {
        await api.delete(`/users/${userProfile._id}/follow`);
        setIsFollowing(false);
        setUserProfile({
          ...userProfile,
          followers: (userProfile.followers || []).filter(
            (id) => id !== currentUser._id
          ),
        });
      } else {
        await api.post(`/users/${userProfile._id}/follow`);
        setIsFollowing(true);
        setUserProfile({
          ...userProfile,
          followers: [...(userProfile.followers || []), currentUser._id],
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert(error.response?.data?.error || "Không thể thực hiện");
    } finally {
      setFollowLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container loading flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container error mt-10">
        <div className="alert alert-error">{error}</div>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-4">
          Về trang chủ
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container error mt-10">
        <div className="alert alert-error">Không tìm thấy hồ sơ</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userProfile._id;

  return (
    <div className="container profile-page">
      {/* Profile Header */}
      <div className="profile-header-section">
        <div className="profile-cover" style={{ position: "relative" }}>
          <img
            src={
              getImageUrl(userProfile.coverImage) ||
              "https://via.placeholder.com/1200x300"
            }
            alt="Cover"
            className="cover-image"
          />
          {isOwnProfile && (
            <button
              onClick={() => setShowCoverModal(true)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(37, 99, 235, 0.9)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                gap: "6px",
                alignItems: "center",
                fontSize: "14px",
                fontWeight: "500",
                backdropFilter: "blur(4px)",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) =>
                (e.target.style.background = "rgba(29, 78, 216, 0.9)")
              }
              onMouseOut={(e) =>
                (e.target.style.background = "rgba(37, 99, 235, 0.9)")
              }
              title="Đổi ảnh bìa"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ width: "16px", height: "16px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Đổi Ảnh Bìa
            </button>
          )}
        </div>

        <div className="profile-info-card">
          <div className="profile-avatar-section">
            <img
              src={
                getImageUrl(userProfile.avatar) ||
                "https://via.placeholder.com/150?text=Avatar"
              }
              alt="Avatar"
              className="profile-avatar"
            />
            {isOwnProfile && (
              <button
                onClick={() => setShowAvatarModal(true)}
                className="avatar-edit-button"
                type="button"
                title="Đổi avatar"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Đổi Avatar</span>
              </button>
            )}
          </div>

          <div className="profile-details">
            <h1 className="profile-name">
              {userProfile.username || "Người dùng"}
            </h1>
            <p className="profile-email">
              <i className="fas fa-envelope"></i> {userProfile.email}
            </p>

            <div className="profile-meta">
              <span className="meta-item">
                <i className="fas fa-calendar"></i>
                Tham gia:{" "}
                {new Date(userProfile.createdAt).toLocaleDateString("vi-VN")}
              </span>
              <span className="meta-item">
                <i className="fas fa-file-alt"></i>
                {userPosts.length} bài viết
              </span>
              <span className={`role-badge role-${userProfile.role}`}>
                {userProfile.role === "admin"
                  ? "👑 Admin"
                  : userProfile.role === "manager"
                  ? "👔 Manager"
                  : "👤 User"}
              </span>
              {userProfile.isVip && userProfile.vipExpiresAt && (
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-linear-to-r from-yellow-400 to-orange-500 text-white">
                  <i className="fas fa-crown mr-1"></i>
                  VIP (
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(userProfile.vipExpiresAt) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
                  ngày)
                </span>
              )}
            </div>

            {/* Luôn hiển thị Bio */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                <i className="fas fa-quote-left text-blue-600 mr-2"></i>
                Tiểu sử
              </h3>
              {userProfile.bio ? (
                <p className="text-gray-700 leading-relaxed italic">
                  {userProfile.bio}
                </p>
              ) : (
                <p className="text-gray-400 italic">
                  {isOwnProfile
                    ? "Chưa có tiểu sử. Hãy thêm tiểu sử của bạn!"
                    : "Người dùng chưa thêm tiểu sử."}
                </p>
              )}
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => navigate(`/profile/${userProfile._id}/edit`)}
                className="btn-edit-profile"
              >
                <i className="fas fa-edit"></i> Chỉnh sửa hồ sơ
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/chat/${userProfile._id}`)}
                  className="btn btn-primary"
                >
                  <i className="fas fa-comment"></i> Nhắn tin
                </button>
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`btn ${
                    isFollowing ? "btn-secondary" : "btn-primary"
                  }`}
                >
                  {followLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : isFollowing ? (
                    <>
                      <i className="fas fa-user-check"></i> Đang theo dõi
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i> Theo dõi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-number">{userPosts.length}</div>
          <div className="stat-label">Bài viết</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {userProfile.followers?.length || 0}
          </div>
          <div className="stat-label">Người theo dõi</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {userProfile.following?.length || 0}
          </div>
          <div className="stat-label">Đang theo dõi</div>
        </div>
      </div>

      {/* User Posts Section */}
      <div className="profile-posts-section">
        <h2 className="section-title">
          <i className="fas fa-file-alt"></i> Bài viết của{" "}
          {userProfile.username}
        </h2>

        {userPosts.length === 0 ? (
          <div className="no-posts-message">
            <i className="fas fa-inbox fa-3x"></i>
            <p>Chưa có bài viết nào</p>
          </div>
        ) : (
          <div className="posts-list">
            {userPosts.map((post) => (
              <div key={post._id} className="post-item">
                <h3>{post.title}</h3>
                <p>{post.content?.substring(0, 150)}...</p>
                <small>
                  <i className="fas fa-calendar-alt"></i>{" "}
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Info Section */}
      {userProfile.phone || userProfile.location || userProfile.website ? (
        <div className="profile-additional">
          <h3 className="section-title">
            <i className="fas fa-info-circle"></i> Thông tin liên hệ
          </h3>
          <div className="info-grid">
            {userProfile.phone && (
              <div className="info-item">
                <i className="fas fa-phone"></i>
                <span>{userProfile.phone}</span>
              </div>
            )}
            {userProfile.location && (
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{userProfile.location}</span>
              </div>
            )}
            {userProfile.website && (
              <div className="info-item">
                <i className="fas fa-globe"></i>
                <a
                  href={userProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {userProfile.website}
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Modals */}
      <ChangeAvatarModal
        isOpen={showAvatarModal}
        currentAvatar={userProfile?.avatar}
        onClose={() => setShowAvatarModal(false)}
        onSuccess={handleAvatarChange}
      />

      <ChangeCoverModal
        isOpen={showCoverModal}
        currentCover={userProfile?.coverImage}
        onClose={() => setShowCoverModal(false)}
        onSuccess={handleCoverChange}
      />
    </div>
  );
};

export default Profile;
