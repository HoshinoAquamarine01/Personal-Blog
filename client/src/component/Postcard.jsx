import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageHelper";

const PostCard = ({ post, onTagClick }) => {
  const navigate = useNavigate();

  return (
    <div className="post-card group animate-slideUp">
      {/* Image */}
      <div className="post-card-image relative overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <i className="fas fa-image text-white text-5xl opacity-30"></i>
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="category-badge bg-blue-500 text-white px-3 py-1 text-xs font-bold">
            <i className="fas fa-tag mr-1"></i>
            {post.category}
          </span>
        </div>

        {/* Stats Overlay */}
        <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <div className="flex gap-4 w-full">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-2 rounded-lg text-white">
              <i className="fas fa-eye"></i>
              <span className="text-sm font-semibold">{post.views || 0}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-2 rounded-lg text-white">
              <i className="fas fa-heart"></i>
              <span className="text-sm font-semibold">{post.likes || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Author & Date */}
        <div className="flex items-center justify-between mb-3 pb-3 border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src={getImageUrl(post.author?.avatar) || "https://via.placeholder.com/32"}
              alt={post.author?.username}
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
            />
            <div className="text-xs">
              <p className="font-semibold text-gray-800 truncate">
                {post.author?.username || "Unknown"}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          {post.author?.role === "admin" && (
            <span className="badge bg-yellow-100 text-yellow-800 text-xs">
              <i className="fas fa-crown mr-1"></i>Author
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 hover:text-primary transition-colors cursor-pointer group-hover:text-primary">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
          {post.content?.substring(0, 120)}...
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onTagClick(tag)}
                className="tag bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
              >
                #{tag}
              </button>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Read More Button */}
        <button
          onClick={() => navigate(`/posts/${post._id}`)}
          className="btn btn-primary w-full mt-auto group/btn"
        >
          <span>Read Article</span>
          <i className="fas fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
