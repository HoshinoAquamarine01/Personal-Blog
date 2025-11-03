import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../style/CreatePost.css";

const CreatePost = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    tags: "",
    thumbnail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!user || !isAdmin()) {
      navigate("/");
    }
  }, [user]);

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
    setLoading(true);

    if (!formData.title || !formData.content) {
      setError("Title and content are required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/posts", {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      });

      alert("Post created successfully!");
      navigate(`/posts/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h1>Create New Post</h1>

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
              disabled={loading}
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
              disabled={loading}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <i className="fas fa-save"></i>
              {loading ? "Creating..." : "Create Post"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/dashboard")}
              disabled={loading}
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

export default CreatePost;
