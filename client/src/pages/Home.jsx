import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import PostCard from "../component/Postcard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchPosts();

    // Check if tag is in URL params
    const tagFromUrl = searchParams.get("tag");
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/posts");
      setPosts(res.data);
      setError("");

      // Extract unique categories
      const uniqueCategories = [
        "All",
        ...new Set(res.data.map((p) => p.category)),
      ];
      setCategories(uniqueCategories);

      // Extract unique tags
      const uniqueTags = [...new Set(res.data.flatMap((p) => p.tags || []))];
      setTags(uniqueTags);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTag, sortBy, posts]);

  const applyFilters = () => {
    let filtered = posts;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.author?.username &&
            post.author.username
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(
        (post) => post.tags && post.tags.includes(selectedTag)
      );
    }

    // Sort posts
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "mostViewed") {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "mostLiked") {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setFilteredPosts(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedTag("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="container home-page animate-fadeIn">
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container home-page">
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
        <button onClick={fetchPosts} className="btn btn-primary">
          <i className="fas fa-redo"></i> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="home-page animate-fadeIn">
      <div className="container">
        {/* Header Section */}
        <div className="mb-12 text-center animate-slideUp">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            <i className="fas fa-blog text-primary mr-3"></i>Blog Articles
          </h1>
          <p className="text-gray-600 text-lg">
            Discover amazing stories and insights
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-10 space-y-6 animate-slideUp">
          <div className="search-bar bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-4 text-primary"></i>
              <input
                type="text"
                placeholder="Search posts by title, content, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-4 text-gray-400 hover:text-primary transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-tag text-primary mr-2"></i>Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-hashtag text-primary mr-2"></i>Tags
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="filter-select"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-sort text-primary mr-2"></i>Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostViewed">Most Viewed</option>
                <option value="mostLiked">Most Liked</option>
              </select>
            </div>

            {(searchQuery ||
              selectedCategory !== "All" ||
              selectedTag ||
              sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 text-primary font-semibold"
              >
                <i className="fas fa-times mr-2"></i>Clear Filters
              </button>
            )}
          </div>

          {/* Popular Tags */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-slideUp">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
              <i className="fas fa-fire text-primary mr-2"></i>Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedTag === tag
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-primary hover:text-white hover:shadow-md"
                  }`}
                >
                  <i className="fas fa-hashtag mr-1"></i>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
            <p className="text-gray-500 text-lg">
              {searchQuery || selectedCategory !== "All" || selectedTag
                ? "No posts found matching your filters"
                : "No posts yet. Check back later!"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center text-gray-600">
              <p>
                Showing{" "}
                <strong className="text-primary">{currentPosts.length}</strong>{" "}
                of{" "}
                <strong className="text-primary">{filteredPosts.length}</strong>{" "}
                posts
              </p>
            </div>

            <div className="posts-list">
              {currentPosts.map((post, idx) => (
                <div
                  key={post._id}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  className="animate-slideUp"
                >
                  <PostCard post={post} onTagClick={handleTagClick} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="pagination-btn disabled:opacity-50"
                >
                  <i className="fas fa-step-backward"></i>
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="pagination-btn disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                <div className="px-4 text-center">
                  <span className="text-gray-700">
                    Page <strong className="text-primary">{currentPage}</strong>{" "}
                    of <strong className="text-primary">{totalPages}</strong>
                  </span>
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="pagination-btn disabled:opacity-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn disabled:opacity-50"
                >
                  <i className="fas fa-step-forward"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
