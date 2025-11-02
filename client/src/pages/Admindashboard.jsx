import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/Authcontext';
import PostForm from '../component/Postform';
import '../style/Admindashboard.css';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({ totalPosts: 0, totalComments: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts');
      setPosts(res.data);
      
      // Calculate stats
      const totalComments = res.data.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
      setStats({
        totalPosts: res.data.length,
        totalComments: totalComments
      });
      
      setError('');
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${postId}`);
        setPosts(posts.filter(p => p._id !== postId));
        alert('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedPost(null);
    fetchPosts();
  };

  const handleNewPost = () => {
    setSelectedPost(null);
    setShowForm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  return (
    <div className="container admin-dashboard">
      <div className="dashboard-header">
        <h1>
          <i className="fas fa-tachometer-alt"></i> Admin Dashboard
        </h1>
        <p>Welcome, <strong>{user?.username || user?.email}</strong>!</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-comments"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalComments}</h3>
            <p>Total Comments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-eye"></i>
          </div>
          <div className="stat-content">
            <h3>{posts.reduce((sum, p) => sum + (p.views || 0), 0)}</h3>
            <p>Total Views</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {showForm ? (
        <>
          <PostForm post={selectedPost} onSuccess={handleFormSuccess} />
          <button 
            onClick={() => {
              setShowForm(false);
              setSelectedPost(null);
            }}
            className="btn btn-secondary"
            style={{ marginTop: '2rem' }}
          >
            <i className="fas fa-times"></i> Cancel
          </button>
        </>
      ) : (
        <>
          <div className="dashboard-actions">
            <h2>
              <i className="fas fa-list"></i> Manage Posts
            </h2>
            <button onClick={handleNewPost} className="btn btn-primary">
              <i className="fas fa-plus"></i> Create New Post
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="no-posts">
              <i className="fas fa-inbox fa-3x"></i>
              <p>No posts yet. Create your first post!</p>
              <button onClick={handleNewPost} className="btn btn-primary">
                <i className="fas fa-plus"></i> Create Post
              </button>
            </div>
          ) : (
            <div className="posts-table-container">
              <table className="posts-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Comments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id}>
                      <td className="title-cell">
                        <strong>{post.title}</strong>
                      </td>
                      <td>
                        {post.category ? (
                          <span className="badge">{post.category}</span>
                        ) : (
                          <span className="badge-empty">-</span>
                        )}
                      </td>
                      <td>{formatDate(post.createdAt)}</td>
                      <td className="center">
                        <i className="fas fa-comments"></i> {post.comments?.length || 0}
                      </td>
                      <td className="actions-cell">
                        <button 
                          onClick={() => handleEditPost(post)}
                          className="btn-action btn-edit"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post._id)}
                          className="btn-action btn-delete"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;