import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import "../style/CreatePost.css";

const EditPost = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    tags: "",
    thumbnail: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate("/");
      return;
    }
    fetchPost();
  }, [id, user]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      setFormData({
        title: res.data.title,
        content: res.data.content,
        category: res.data.category,
        tags: res.data.tags.join(", "),
        thumbnail: res.data.thumbnail,
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to load post");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      setSaving(false);
      return;
    }

    try {
      await api.put(`/posts/${id}`, {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      });

      alert("Post updated successfully!");
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h1>Edit Post</h1>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content"
              rows="10"
              required
              disabled={saving}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="General">General</option>
                <option value="Technology">Technology</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Business">Business</option>
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              disabled={saving}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className="fas fa-save"></i>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/posts/${id}`)}
              disabled={saving}
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
