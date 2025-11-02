import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import PostCard from '../component/Postcard';
import '../style/Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.author?.username && post.author.username.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts');
      setPosts(res.data);
      setFilteredPosts(res.data);
      setError('');
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
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
    <div className="container home-page">
      <div className="home-header">
        <h1 className="page-title">
          <i className="fas fa-blog"></i> Latest Posts
        </h1>
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search posts by title, content, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="clear-search"
              title="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <i className="fas fa-inbox fa-3x"></i>
          <p>
            {searchQuery 
              ? `No posts found matching "${searchQuery}"`
              : 'No posts yet. Check back later!'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="posts-stats">
            <p>
              Showing {filteredPosts.length} of {posts.length} post{posts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="posts-list">
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;