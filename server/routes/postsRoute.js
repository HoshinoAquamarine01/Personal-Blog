import express from 'express';
import Post from '../model/Post.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get post by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email')
      .populate('comments.author', 'username email');
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Create post (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content, category, tags, thumbnail } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content required' });
    }

    const newPost = new Post({
      title,
      content,
      category: category || 'General',
      tags: tags || [],
      thumbnail: thumbnail || '',
      author: req.user.id,
      isPublished: true
    });

    await newPost.save();
    await newPost.populate('author', 'username email');
    
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update post (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content, category, tags, thumbnail, isPublished } = req.body;
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        content, 
        category, 
        tags, 
        thumbnail,
        isPublished 
      },
      { new: true, runValidators: true }
    ).populate('author', 'username email');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete post (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Add comment (users + admin)
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      text: text.trim(),
      author: req.user.id
    });

    await post.save();
    await post.populate('comments.author', 'username email');
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Delete comment (own comment or admin)
router.delete('/:id/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if user is comment author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();
    
    res.json({ message: 'Comment deleted successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// Increment views
router.patch('/:id/views', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username email');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating views', error: error.message });
  }
});

// Like post
router.patch('/:id/like', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    ).populate('author', 'username email');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
});

export default router;