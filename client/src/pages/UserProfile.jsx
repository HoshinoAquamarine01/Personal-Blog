import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";
import "../style/UserProfile.css";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile, updateAvatar } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    bio: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${id}`);
      setProfile(res.data);
      setEditData({
        username: res.data.username,
        bio: res.data.bio || "",
        avatar: res.data.avatar || "",
      });
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser || currentUser._id !== id) {
      setError("You can only edit your own profile");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile(id, editData);
      if (result.success) {
        setProfile(result.user);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === id;

  return (
    <div className="container user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.username} />
            ) : (
              <div className="avatar-placeholder">
                <i className="fas fa-user fa-3x"></i>
              </div>
            )}
            {isOwnProfile && isEditing && (
              <input
                type="url"
                placeholder="Avatar URL"
                value={editData.avatar}
                onChange={(e) =>
                  setEditData({ ...editData, avatar: e.target.value })
                }
                className="avatar-input"
              />
            )}
          </div>

          <div className="profile-info">
            {isEditing ? (
              <input
                type="text"
                value={editData.username}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
                className="username-input"
              />
            ) : (
              <h1>{profile?.username}</h1>
            )}

            <p className="email">
              <i className="fas fa-envelope"></i>
              {profile?.email}
            </p>

            <p className="role">
              <span className={`badge ${profile?.role}`}>
                {profile?.role === "admin" ? (
                  <>
                    <i className="fas fa-crown"></i> Author
                  </>
                ) : (
                  "User"
                )}
              </span>
            </p>

            <p className="joined">
              <i className="fas fa-calendar"></i>
              Joined {new Date(profile?.createdAt).toLocaleDateString()}
            </p>

            {isOwnProfile && (
              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      <i className="fas fa-save"></i>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary"
                    >
                      <i className="fas fa-times"></i>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-edit"></i>
                      Edit Profile
                    </button>
                    <button
                      onClick={() => navigate("/change-password")}
                      className="btn btn-secondary"
                    >
                      <i className="fas fa-key"></i>
                      Change Password
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-bio">
          <h3>Bio</h3>
          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={(e) =>
                setEditData({ ...editData, bio: e.target.value })
              }
              placeholder="Tell us about yourself..."
              rows="5"
            ></textarea>
          ) : (
            <p>{profile?.bio || "No bio yet"}</p>
          )}
        </div>

        <div className="profile-footer">
          <button onClick={() => navigate("/")} className="btn btn-secondary">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
