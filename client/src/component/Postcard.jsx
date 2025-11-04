import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Postcard.css";

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/posts/${post._id}`);
  };

  return (
    <div className="post-card">
      {post.thumbnail && (
        <div className="post-card-image">
          <img src={post.thumbnail} alt={post.title} />
        </div>
      )}

      <div className="post-card-content">
        <div className="post-card-header">
          <h3>{post.title}</h3>
          <span className="category-badge">{post.category}</span>
        </div>

        <p className="post-card-excerpt">{post.content.substring(0, 150)}...</p>

        <div className="post-card-meta">
          <span className="meta-item">
            <i className="fas fa-user"></i>
            <span className="meta-text">
              {post.author?.username || "Unknown"}
            </span>
          </span>
          <span className="meta-item">
            <i className="fas fa-calendar"></i>
            <span className="meta-text">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </span>
          <span className="meta-item">
            <i className="fas fa-eye"></i>
            <span className="meta-text">{post.views || 0}</span>
          </span>
          <span className="meta-item">
            <i className="fas fa-heart"></i>
            <span className="meta-text">{post.likes || 0}</span>
          </span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button onClick={handleReadMore} className="btn-read-more">
          Read More
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
