import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import api from '../utils/api';
import '../style/Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${id}`);
      setUser(res.data);
      setFormData({
        username: res.data.username,
        bio: res.data.bio || '',
        avatar: res.data.avatar || ''
      });
    } catch (err) {
      setError('Error loading user profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Chỉ user chính mới có thể edit
    if (currentUser?._id !== id && currentUser?.role !== 'admin') {
      setError('You can only edit your own profile');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await api.put(`/users/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Update localStorage
      if (currentUser?._id === id) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const isOwnProfile = currentUser?._id === id || currentUser?.role === 'admin';

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="avatar-section">
            <img 
              src={user?.avatar || 'https://via.placeholder.com/200?text=Avatar'} 
              alt={user?.username}
              className="avatar-large"
            />
            {isOwnProfile && (
              <label className="avatar-upload">
                <i className="fas fa-camera"></i>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    // TODO: Upload image and get URL
                    const url = prompt('Paste image URL:');
                    if (url) {
                      setFormData(prev => ({ ...prev, avatar: url }));
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="profile-info">
            {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}

            {!isEditing ? (
              <>
                <h1>{user?.username}</h1>
                <p className="email"><i className="fas fa-envelope"></i> {user?.email}</p>
                <p className="role">
                  <i className="fas fa-tag"></i> 
                  <span className={`badge badge-${user?.role}`}>{user?.role}</span>
                </p>
                <p className="bio">{user?.bio || 'No bio yet'}</p>
                <p className="joined">
                  <i className="fas fa-calendar"></i> 
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </p>

                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="btn-edit">
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength="2"
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength="1000"
                    rows="4"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="form-group">
                  <label>Avatar URL</label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {formData.avatar && (
                    <img src={formData.avatar} alt="Preview" className="avatar-preview" />
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    <i className="fas fa-save"></i> Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;