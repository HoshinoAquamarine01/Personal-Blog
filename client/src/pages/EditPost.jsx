import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

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
    return (
      <div className="min-h-screen bg-slate-100 py-10 animate-fadeIn">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 animate-fadeIn">
      <div className="container max-w-4xl mx-auto">
        <div className="card shadow-2xl animate-slideUp">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
              <i className="fas fa-edit text-primary"></i>
              Edit Post
            </h1>
            <p className="text-gray-600 mt-2">Update your post content</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-6 animate-slideUp">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-heading text-primary mr-2"></i>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter post title"
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-align-left text-primary mr-2"></i>
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="form-control"
                placeholder="Write your post content"
                rows="12"
                required
                disabled={saving}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="flex items-center font-semibold text-gray-700 mb-2">
                  <i className="fas fa-tag text-primary mr-2"></i>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="filter-select"
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
                <label className="flex items-center font-semibold text-gray-700 mb-2">
                  <i className="fas fa-hashtag text-primary mr-2"></i>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="tag1, tag2, tag3"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="flex items-center font-semibold text-gray-700 mb-2">
                <i className="fas fa-image text-primary mr-2"></i>
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="form-control"
                placeholder="https://example.com/image.jpg"
                disabled={saving}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={saving}
              >
                <i className="fas fa-save"></i>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="btn btn-secondary flex-1"
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
    </div>
  );
};

export default EditPost;
