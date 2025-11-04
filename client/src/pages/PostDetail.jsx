import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";
import "../style/PostDetail.css";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewIncremented, setViewIncremented] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
      setError("");

      // Increment view count
      if (!viewIncremented) {
        incrementViews();
      }
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await api.patch(`/posts/${id}/views`);
      setViewIncremented(true);
    } catch (err) {
      console.error("Error incrementing views:", err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like posts");
      navigate("/login");
      return;
    }

    try {
      const res = await api.patch(`/posts/${id}/like`);
      setPost(res.data);
      setLiked(true);
    } catch (err) {
      console.error("Error liking post:", err);
      alert("Failed to like post");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to comment");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, {
        text: commentText,
      });
      setPost(res.data);
      setCommentText("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const res = await api.delete(`/posts/${id}/comments/${commentId}`);
      setPost(res.data.post);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-page">
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <h2>{error || "Post not found"}</h2>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        {post.thumbnail && (
          <div className="post-thumbnail">
            <img src={post.thumbnail} alt={post.title} />
          </div>
        )}

        <div className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span className="author">
              <i className="fas fa-user"></i>
              {post.author?.username || "Unknown"}
            </span>
            <span className="date">
              <i className="fas fa-calendar"></i>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span className="category">
              <i className="fas fa-tag"></i>
              {post.category}
            </span>
          </div>
        </div>

        <div className="post-content">{post.content}</div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="post-actions">
          <div className="action-group">
            <span className="stat">
              <i className="fas fa-eye"></i>
              {post.views || 0} views
            </span>
            <span className="stat">
              <i className="fas fa-heart"></i>
              {post.likes || 0} likes
            </span>
            <span className="stat">
              <i className="fas fa-comments"></i>
              {post.comments?.length || 0} comments
            </span>
          </div>

          <button
            onClick={handleLike}
            className={`btn-like ${liked ? "liked" : ""}`}
            disabled={liked}
          >
            <i className={`fas fa-heart ${liked ? "fas" : "far"}`}></i>
            {liked ? "Liked" : "Like"}
          </button>
        </div>

        <div className="comments-section">
          <h3>Comments ({post.comments?.length || 0})</h3>

          {user && (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows="4"
                disabled={submittingComment}
              ></textarea>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingComment}
              >
                {submittingComment ? "Posting..." : "Post Comment"}
              </button>
            </form>
          )}

          {!user && (
            <div className="login-prompt">
              <p>
                Please{" "}
                <button onClick={() => navigate("/login")} className="link-btn">
                  login
                </button>{" "}
                to comment
              </p>
            </div>
          )}

          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <strong>{comment.author?.username || "Unknown"}</strong>
                      {comment.author?.role === "admin" && (
                        <span className="author-badge">
                          <i className="fas fa-crown"></i> Author
                        </span>
                      )}
                    </div>
                    <div className="comment-header-right">
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {(user?.role === "admin" ||
                        user?._id === comment.author?._id) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="btn-delete-comment"
                          title="Delete comment"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>

        <div className="post-footer">
          <button onClick={() => navigate("/")} className="btn btn-secondary">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
