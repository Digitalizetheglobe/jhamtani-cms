const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementViews,
  toggleLike,
} = require('../controllers/blogController');

router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);
router.patch('/:id/views', incrementViews);
router.patch('/:id/like', toggleLike);

module.exports = router;
