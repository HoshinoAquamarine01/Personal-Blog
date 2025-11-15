import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../utils/api";

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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

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
      await api.post(`/posts/${id}/comments`, {
        text: commentText,
      });
      setCommentText("");
      // Re-fetch post để lấy comment mới với đầy đủ thông tin
      await fetchPost();
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

  const handleLikeComment = async (commentId, shouldLike) => {
    if (!user) {
      alert("Please login to like comments");
      navigate("/login");
      return;
    }

    try {
      const res = await api.patch(`/posts/${id}/comments/${commentId}/like`, {
        like: shouldLike,
      });
      setPost(res.data);
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleDislikeComment = async (commentId, shouldDislike) => {
    if (!user) {
      alert("Please login to dislike comments");
      navigate("/login");
      return;
    }

    try {
      const res = await api.patch(
        `/posts/${id}/comments/${commentId}/dislike`,
        { dislike: shouldDislike }
      );
      setPost(res.data);
    } catch (err) {
      console.error("Error disliking comment:", err);
    }
  };

  const handleAddReply = async (e, commentId) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to reply");
      navigate("/login");
      return;
    }

    if (!replyText.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    setSubmittingComment(true);
    try {
      await api.post(`/posts/${id}/comments/${commentId}/replies`, {
        text: replyText,
      });
      setReplyText("");
      setReplyingTo(null);
      // Re-fetch post để lấy reply mới
      await fetchPost();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add reply");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;

    try {
      const res = await api.delete(
        `/posts/${id}/comments/${commentId}/replies/${replyId}`
      );
      setPost(res.data.post);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete reply");
    }
  };

  const handleTagClick = (tag) => {
    // Navigate về Home với tag selected
    navigate(`/?tag=${encodeURIComponent(tag)}`);
  };

  const handleSharePost = (platform) => {
    const postUrl = window.location.href;
    const title = post.title;
    const excerpt = post.content.substring(0, 100);
    const shareText = `${title}\n\n${excerpt}...\n\nRead more: ${postUrl}`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        postUrl
      )}&text=${encodeURIComponent(`${title} ${postUrl}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        postUrl
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        `📰 ${title}\n\n${excerpt}...\n\n🔗 ${postUrl}`
      )}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(
        postUrl
      )}&text=${encodeURIComponent(`📰 ${title}\n\n${excerpt}...`)}`,
      email: `mailto:?subject=${encodeURIComponent(
        `Check out: ${title}`
      )}&body=${encodeURIComponent(shareText)}`,
      copy: null, // Special case
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(postUrl);
      alert("✅ Link copied to clipboard!");
      return;
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return (
      <div className="post-detail-page animate-fadeIn">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-page">
        <div className="container max-w-3xl mx-auto">
          <div className="card bg-red-50 border-l-4 border-danger text-center py-12">
            <i className="fas fa-exclamation-circle text-5xl text-danger mb-4 block"></i>
            <h2 className="text-2xl font-bold text-danger mb-4">
              {error || "Post not found"}
            </h2>
            <button onClick={() => navigate("/")} className="btn btn-primary">
              <i className="fas fa-arrow-left"></i> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page py-12 animate-fadeIn">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-gray-600 text-sm animate-slideUp">
          <button
            onClick={() => navigate("/")}
            className="hover:text-primary transition-colors"
          >
            <i className="fas fa-home"></i> Home
          </button>
          <i className="fas fa-chevron-right"></i>
          <span className="text-primary font-semibold">{post.category}</span>
          <i className="fas fa-chevron-right"></i>
          <span className="truncate">{post.title.substring(0, 30)}...</span>
        </div>

        {/* Main Article */}
        <article className="animate-slideUp">
          {/* Featured Image */}
          {post.thumbnail && (
            <div className="relative w-full h-96 md:h-[28rem] rounded-2xl overflow-hidden shadow-2xl mb-12 group">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Article Header */}
          <div className="mb-12">
            {/* Category & Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="category-badge bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                <i className="fas fa-tag"></i>
                {post.category}
              </span>
              {post.author?.role === "admin" && (
                <span className="badge bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-bold">
                  <i className="fas fa-crown mr-1"></i>Official
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 py-6 border-y-2 border-gray-200">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white overflow-hidden">
                  {post.author?.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-lg"></i>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">By</p>
                  <p 
                    onClick={() => navigate(`/profile/${post.author?._id}`)}
                    className="font-bold text-gray-800 hover:text-primary cursor-pointer transition-colors"
                  >
                    {post.author?.username || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fas fa-calendar-alt text-primary"></i>
                <span>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Read Time */}
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fas fa-clock text-primary"></i>
                <span>
                  {Math.ceil(post.content.split(" ").length / 200)} min read
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                  <i className="fas fa-eye"></i>
                  <span className="text-sm font-semibold">
                    {post.views || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                  <i className="fas fa-heart"></i>
                  <span className="text-sm font-semibold">
                    {post.likes || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-8 md:p-12 border-l-4 border-primary">
              <div className="text-lg leading-8 text-gray-800 whitespace-pre-wrap break-words">
                {post.content}
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-12 py-8 border-y-2 border-gray-200">
              <h3 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider">
                <i className="fas fa-hashtag mr-2"></i>Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTagClick(tag)}
                    className="tag bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold hover:shadow-md hover:from-blue-100 hover:to-purple-100 transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-slideUp">
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-semibold">
                  <i className="fas fa-share-alt text-primary mr-2"></i>Share
                  this post:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSharePost("facebook")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold group"
                  title="Share on Facebook - Opens share dialog with post link"
                >
                  <i className="fab fa-facebook-f"></i>
                  <span>Facebook</span>
                  <i className="fas fa-external-link-alt text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
                <button
                  onClick={() => handleSharePost("twitter")}
                  className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold group"
                  title="Share on Twitter - Tweet with post title and link"
                >
                  <i className="fab fa-twitter"></i>
                  <span>Twitter</span>
                  <i className="fas fa-external-link-alt text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
                <button
                  onClick={() => handleSharePost("linkedin")}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold group"
                  title="Share on LinkedIn - Post will include link"
                >
                  <i className="fab fa-linkedin-in"></i>
                  <span>LinkedIn</span>
                  <i className="fas fa-external-link-alt text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
                <button
                  onClick={() => handleSharePost("whatsapp")}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold group"
                  title="Share on WhatsApp - Message with post link"
                >
                  <i className="fab fa-whatsapp"></i>
                  <span>WhatsApp</span>
                  <i className="fas fa-external-link-alt text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
                <button
                  onClick={() => handleSharePost("telegram")}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold group"
                  title="Share on Telegram - Message with post link"
                >
                  <i className="fab fa-telegram"></i>
                  <span>Telegram</span>
                  <i className="fas fa-external-link-alt text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
                <button
                  onClick={() => handleSharePost("email")}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold group"
                  title="Share via Email - Email with post link"
                >
                  <i className="fas fa-envelope"></i>
                  <span>Email</span>
                  <i className="fas fa-external-link-alt text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
                <button
                  onClick={() => handleSharePost("copy")}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold group"
                  title="Copy link to clipboard"
                >
                  <i className="fas fa-copy"></i>
                  <span>Copy Link</span>
                  <i className="fas fa-external-link-alt text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
              </div>
            </div>

            <button
              onClick={handleLike}
              className={`btn transition-all ${
                liked
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white border-2 border-red-500 text-red-500 hover:bg-red-50"
              }`}
              disabled={liked}
            >
              <i className={`fas fa-heart ${liked ? "fas" : "far"}`}></i>
              {liked ? "Liked" : "Like this post"}
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <section className="mt-16 animate-slideUp">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-slate-800 mb-2">
              <i className="fas fa-comments text-primary mr-3"></i>
              Discussion
            </h2>
            <p className="text-gray-600">
              {post.comments?.length || 0} comments
            </p>
          </div>

          {/* Comment Form */}
          {user ? (
            <form
              onSubmit={handleAddComment}
              className="mb-12 p-6 md:p-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-gray-200"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-lg"></i>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{user?.username}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts on this article..."
                rows="4"
                className="form-control mb-4 resize-none"
                disabled={submittingComment}
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingComment}
                >
                  <i className="fas fa-paper-plane"></i>
                  {submittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-primary text-center">
              <i className="fas fa-sign-in-alt text-4xl text-primary mb-4 block"></i>
              <p className="text-gray-700 font-semibold mb-4">
                Want to join the discussion?
              </p>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-primary"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>Login to Comment
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="comment-item p-6 bg-white border-l-4 border-primary rounded-lg hover:shadow-lg transition-all duration-300 animate-slideUp"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                        {comment.author?.avatar ? (
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>

                      {/* Author Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <strong 
                            onClick={() => navigate(`/profile/${comment.author?._id}`)}
                            className="text-gray-800 hover:text-primary cursor-pointer transition-colors"
                          >
                            {comment.author?.username || "Unknown"}
                          </strong>
                          {comment.author?.role === "admin" && (
                            <span className="badge bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">
                              <i className="fas fa-crown mr-1"></i>Author
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    {(user?.role === "admin" ||
                      user?._id === comment.author?._id) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-4"
                        title="Delete comment"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>

                  {/* Comment Text */}
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                    {comment.text}
                  </p>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                    {/* Like Button */}
                    <button
                      onClick={() =>
                        handleLikeComment(comment._id, !comment.userLiked)
                      }
                      className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                        comment.userLiked
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-600 hover:text-red-500"
                      }`}
                      disabled={!user}
                    >
                      <i
                        className={`fas fa-heart ${
                          comment.userLiked ? "fas" : "far"
                        }`}
                      ></i>
                      <span>{comment.likes || 0}</span>
                    </button>

                    {/* Dislike Button */}
                    <button
                      onClick={() =>
                        handleDislikeComment(comment._id, !comment.userDisliked)
                      }
                      className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                        comment.userDisliked
                          ? "text-blue-500 hover:text-blue-600"
                          : "text-gray-600 hover:text-blue-500"
                      }`}
                      disabled={!user}
                    >
                      <i
                        className={`fas fa-thumbs-down ${
                          comment.userDisliked ? "fas" : "far"
                        }`}
                      ></i>
                      <span>{comment.dislikes || 0}</span>
                    </button>

                    {/* Reply Button */}
                    <button
                      onClick={() => setReplyingTo(comment._id)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-all"
                      disabled={!user}
                    >
                      <i className="fas fa-reply"></i>
                      Reply
                    </button>

                    {/* Replies Count */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-auto text-sm text-gray-600">
                        <i className="fas fa-comments text-primary mr-1"></i>
                        {comment.replies.length} replies
                      </div>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment._id && user && (
                    <form
                      onSubmit={(e) => handleAddReply(e, comment._id)}
                      className="mt-6 pt-4 border-t border-gray-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="fas fa-user text-sm"></i>
                          )}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows="3"
                            className="form-control text-sm"
                          ></textarea>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="submit"
                              className="btn btn-primary text-sm py-2 px-4"
                              disabled={submittingComment}
                            >
                              <i className="fas fa-paper-plane"></i>
                              Post Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                              className="btn btn-secondary text-sm py-2 px-4"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply._id}
                          className="ml-8 p-4 bg-gray-50 rounded-lg border-l-2 border-primary"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
                                {reply.author?.avatar ? (
                                  <img
                                    src={reply.author.avatar}
                                    alt={reply.author.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <i className="fas fa-user text-xs"></i>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong 
                                    onClick={() => navigate(`/profile/${reply.author?._id}`)}
                                    className="text-sm text-gray-800 hover:text-primary cursor-pointer transition-colors"
                                  >
                                    {reply.author?.username || "Unknown"}
                                  </strong>
                                  {reply.author?.role === "admin" && (
                                    <span className="badge bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5">
                                      <i className="fas fa-crown"></i>
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                            {(user?.role === "admin" ||
                              user?._id === reply.author?._id) && (
                              <button
                                onClick={() =>
                                  handleDeleteReply(comment._id, reply._id)
                                }
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {reply.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-dashed border-gray-300">
                <i className="fas fa-comment-slash text-4xl text-gray-300 mb-3 block"></i>
                <p className="text-gray-600 font-semibold mb-2">
                  No comments yet
                </p>
                <p className="text-gray-500 text-sm">
                  Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Back Button */}
        <div className="mt-16 py-8 border-t-2 border-gray-200 text-center">
          <button
            onClick={() => navigate("/")}
            className="btn btn-secondary hover:shadow-lg"
          >
            <i className="fas fa-arrow-left"></i> Back to Articles
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
