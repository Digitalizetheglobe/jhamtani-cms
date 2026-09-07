const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Use the correct uploads directory path
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP files are allowed'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 100 }, // Limit file size to 100MB
});
// Get all blogs
// GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single blog by ID
// GET /api/blogs/:id
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get blog by slug
// GET /api/blogs/slug/:slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new blog
// POST /api/blogs
exports.createBlog = [
  upload.any(), // Accept any file field name
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    try {
      console.log('Request Body:', req.body); // Log the request body
      console.log('Uploaded Files:', req.files); // Log the uploaded files
      console.log('Request Headers:', req.headers['content-type']); // Log content type

      const {
        title, content, slug, tags, excerpt, coverImage, author, categories,
        metaTitle, metaDescription, ogTitle, ogDescription, ogImage, readTime,
        isPublished, publishedAt
      } = req.body;

      let uploadImage = null;
      let coverImageUrl = coverImage; // Use coverImage from request body if provided
      
      if (req.files && req.files.length > 0) {
        // Use the first uploaded file
        const file = req.files[0];
        uploadImage = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        
        // If no coverImage was provided, use the uploaded file as coverImage
        if (!coverImageUrl) {
          coverImageUrl = uploadImage;
        }
      }

      // Parse tags if they are stringified JSON (from FormData)
      let parsedTags = tags;
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = tags.split(',').map(t => t.trim());
        }
      }

      // Parse categories if they are stringified JSON
      let parsedCategories = categories;
      if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (e) {
          parsedCategories = categories.split(',').map(c => c.trim());
        }
      }

      const isPublishedBool = isPublished === 'true' || isPublished === true;

      const newBlog = new Blog({
        title,
        content,
        slug,
        tags: parsedTags || [],
        excerpt,
        coverImage: coverImageUrl,
        author,
        categories: parsedCategories || [],
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImage,
        readTime: Number(readTime) || 0,
        uploadImage,
        isPublished: isPublishedBool,
        publishedAt: publishedAt ? new Date(publishedAt) : (isPublishedBool ? new Date() : null),
      });

      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    } catch (error) {
      console.error('Error creating blog:', error.message); // Log the error
      res.status(400).json({ message: 'Failed to create blog', error: error.message });
    }
  },
];

// Update blog
// PUT /api/blogs/:id
exports.updateBlog = [
  upload.any(), // Accept any file field name
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    try {
      console.log('Update Request Body:', req.body);
      console.log('Update Uploaded Files:', req.files);

      const blogId = req.params.id;
      const existingBlog = await Blog.findById(blogId);
      
      if (!existingBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const { 
        title, content, slug, tags, excerpt, coverImage, author, categories, 
        metaTitle, metaDescription, ogTitle, ogDescription, ogImage, readTime,
        isPublished, publishedAt 
      } = req.body;

      // Handle file uploads
      let coverImageUrl = coverImage;
      let uploadImage = existingBlog.uploadImage;

      if (req.files && req.files.length > 0) {
        const file = req.files[0];
        uploadImage = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        coverImageUrl = uploadImage;
      }

      // Parse tags and categories if JSON string
      let parsedTags = tags;
      if (tags && typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = tags.split(',').map(t => t.trim());
        }
      }

      let parsedCategories = categories;
      if (categories && typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (e) {
          parsedCategories = categories.split(',').map(c => c.trim());
        }
      }

      const isPublishedBool = isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : existingBlog.isPublished;

      const updateData = {
        title: title !== undefined ? title : existingBlog.title,
        content: content !== undefined ? content : existingBlog.content,
        slug: slug !== undefined ? slug : existingBlog.slug,
        excerpt: excerpt !== undefined ? excerpt : existingBlog.excerpt,
        coverImage: coverImageUrl,
        uploadImage: uploadImage,
        author: author !== undefined ? author : existingBlog.author,
        tags: parsedTags !== undefined ? parsedTags : existingBlog.tags,
        categories: parsedCategories !== undefined ? parsedCategories : existingBlog.categories,
        metaTitle: metaTitle !== undefined ? metaTitle : existingBlog.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existingBlog.metaDescription,
        ogTitle: ogTitle !== undefined ? ogTitle : existingBlog.ogTitle,
        ogDescription: ogDescription !== undefined ? ogDescription : existingBlog.ogDescription,
        ogImage: ogImage !== undefined ? ogImage : existingBlog.ogImage,
        readTime: readTime !== undefined ? (Number(readTime) || 0) : existingBlog.readTime,
        isPublished: isPublishedBool,
        publishedAt: publishedAt ? new Date(publishedAt) : (isPublishedBool && !existingBlog.publishedAt ? new Date() : existingBlog.publishedAt),
      };

      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        updateData,
        { new: true, runValidators: true }
      );
      
      res.status(200).json(updatedBlog);
    } catch (error) {
      console.error('Error updating blog:', error.message);
      res.status(400).json({ message: 'Failed to update blog', error: error.message });
    }
  }
];

// Delete blog
// DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Increment blog views
// PATCH /api/blogs/:id/views
exports.incrementViews = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle like blog
// PATCH /api/blogs/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Simple increment - in a real app you'd track which users liked the post
    blog.likes += 1;
    await blog.save();
    
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};