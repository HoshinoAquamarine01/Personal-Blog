import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/Authcontext';
import '../style/Pagedetails.css';

const PostDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      await api.post(`/posts/${id}/comments`, {
        text: commentText,
      });
      setCommentText('');
      await fetchPost();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/posts/${id}/comments/${commentId}`);
        await fetchPost();
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (!post) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> Post not found
        </div>
        <Link to="/" className="btn btn-primary">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container post-detail-page">
      <div className="post-detail">
        <div className="post-header">
          <h1>{post.title}</h1>
          {post.category && (
            <span className="post-category">{post.category}</span>
          )}
        </div>
        
        <div className="post-meta">
          <span className="post-author">
            <i className="fas fa-user"></i> {post.author?.username || post.author || 'Anonymous'}
          </span>
          <span className="post-date">
            <i className="fas fa-calendar"></i> {formatDate(post.createdAt)}
          </span>
        </div>

        <div className="post-content">{post.content}</div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="comments-section">
          <h2>
            <i className="fas fa-comments"></i> Comments ({post.comments?.length || 0})
          </h2>

          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <div className="comment-form-header">
                <div className="comment-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <strong>{user?.username || user?.email}</strong>
              </div>
              <textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                disabled={submittingComment}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submittingComment}
              >
                {submittingComment ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Posting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Post Comment
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <i className="fas fa-info-circle"></i>
              <p>
                Please <Link to="/admin/login">login</Link> to leave a comment
              </p>
            </div>
          )}

          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <div className="comment-avatar">
                        <i className="fas fa-user-circle"></i>
                      </div>
                      <div>
                        <strong className="comment-author">
                          {comment.author?.username || comment.author || 'Anonymous'}
                        </strong>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    
                    {isAuthenticated && user && (user._id === comment.author?._id || user.role === 'admin') && (
                      <button 
                        onClick={() => handleDeleteComment(comment._id)} 
                        className="btn-delete-comment"
                        title="Delete comment"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="no-comments">
                <i className="fas fa-comment-slash fa-2x"></i>
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>

        <div className="back-link">
          <Link to="/" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;