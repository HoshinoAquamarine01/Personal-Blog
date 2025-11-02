import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Postcard.css';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        <h2 className="post-title">
          <Link to={`/post/${post._id}`}>{post.title}</Link>
        </h2>
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

      <p className="post-content">
        {truncateContent(post.content)}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="post-footer">
        <div className="post-stats">
          <span className="post-comments">
            <i className="fas fa-comments"></i> {post.comments?.length || 0}
          </span>
          {post.views && (
            <span className="post-views">
              <i className="fas fa-eye"></i> {post.views}
            </span>
          )}
        </div>
        <Link to={`/post/${post._id}`} className="btn-read-more">
          Read More <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;