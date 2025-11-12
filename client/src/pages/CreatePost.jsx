import React, { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const CreatePost = () => {
  const { user, isAdmin, isManager } = useAuth();
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
    const hasAccess = user && (isAdmin() || user.role === "manager");
    if (!hasAccess) {
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

    console.log("📝 Submitting post form:", formData);

    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      setLoading(false);
      return;
    }

    if (formData.title.length < 3) {
      setError("Title must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (formData.content.length < 10) {
      setError("Content must be at least 10 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Calling API POST /posts...");

      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        thumbnail: formData.thumbnail.trim() || "",
      };

      console.log("📦 Payload:", payload);

      const res = await api.post("/posts", payload);

      console.log("✅ Post created successfully:", res.data);
      if (user.role === "manager") {
        alert("Post submitted successfully! It will be visible after admin approval.");
        navigate("/manager/dashboard");
      } else {
        alert("Post created successfully!");
        navigate(`/posts/${res.data._id}`);
      }
    } catch (err) {
      console.error("❌ Error response:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.response?.data?.error,
        fullError: err,
      });
      setError(
        err.response?.data?.message || err.message || "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 animate-fadeIn">
      <div className="container max-w-4xl mx-auto">
        <div className="card shadow-2xl animate-slideUp">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
              <i className="fas fa-pen-fancy text-primary"></i>
              Create New Post
            </h1>
            <p className="text-gray-600 mt-2">Share your amazing story</p>
            {user?.role === "manager" && (
              <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p className="text-sm text-orange-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  <strong>Manager Note:</strong> Your post will be submitted for admin approval before being published.
                </p>
              </div>
            )}
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
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
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
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                <i className="fas fa-save"></i>
                {loading ? "Creating..." : "Create Post"}
              </button>
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={() => navigate(user?.role === "manager" ? "/manager/dashboard" : "/admin/dashboard")}
                disabled={loading}
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

export default CreatePost;
