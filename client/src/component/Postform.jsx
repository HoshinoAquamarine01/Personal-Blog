import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../style/Postform.css';

const PostForm = ({ post, onSuccess }) => {
  const [title, setTitle] = useState(post ? post.title : '');
  const [content, setContent] = useState(post ? post.content : '');
  const [category, setCategory] = useState(post ? post.category : '');
  const [tags, setTags] = useState(post ? (post.tags || []).join(', ') : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category || '');
      setTags(post.tags ? post.tags.join(', ') : '');
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const postData = {
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      };

      if (post) {
        await api.put(`/posts/${post._id}`, postData);
      } else {
        await api.post('/posts', postData);
      }

      setTitle('');
      setContent('');
      setCategory('');
      setTags('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post. Please try again.');
      console.error('Error saving post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form-container">
      <h2>
        <i className="fas fa-edit"></i> {post ? 'Edit Post' : 'Create New Post'}
      </h2>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">
            <i className="fas fa-heading"></i> Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="form-control"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">
            <i className="fas fa-folder"></i> Category
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Technology, Travel, Food"
            className="form-control"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">
            <i className="fas fa-tags"></i> Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Separate tags with commas"
            className="form-control"
            disabled={loading}
          />
          <small className="form-text">Separate tags with commas (e.g., react, javascript, tutorial)</small>
        </div>

        <div className="form-group">
          <label htmlFor="content">
            <i className="fas fa-align-left"></i> Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content..."
            rows="12"
            className="form-control"
            required
            disabled={loading}
          />
          <small className="form-text">{content.length} characters</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> {post ? 'Update Post' : 'Create Post'}
              </>
            )}
          </button>
          {post && (
            <button
              type="button"
              onClick={() => {
                setTitle(post.title);
                setContent(post.content);
                setCategory(post.category || '');
                setTags(post.tags ? post.tags.join(', ') : '');
                setError('');
              }}
              className="btn btn-secondary"
              disabled={loading}
            >
              <i className="fas fa-undo"></i> Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PostForm;