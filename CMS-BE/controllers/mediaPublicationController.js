const MediaPublication = require('../models/MediaPublication');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'media');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, `media-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (imageTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Article image must be JPEG, PNG, GIF, or WebP'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 25 },
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'File upload error', error: err.message });
  }
  if (err) {
    return res.status(400).json({ message: 'File validation error', error: err.message });
  }
  next();
};

const deleteFileIfExists = (relativeUrl) => {
  if (!relativeUrl || !relativeUrl.startsWith('/uploads/')) return;
  const filePath = path.join(__dirname, '..', relativeUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// GET /api/media-publications
exports.getMediaPublications = async (req, res) => {
  try {
    const { isActive, category, page = 1, limit = 50 } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const mediaArticles = await MediaPublication.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await MediaPublication.countDocuments(query);

    res.status(200).json({
      mediaArticles,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: parseInt(limit, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/media-publications/:id
exports.getMediaPublicationById = async (req, res) => {
  try {
    const item = await MediaPublication.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Media publication not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/media-publications
exports.createMediaPublication = [
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      const {
        publisher,
        category,
        date,
        readTime,
        title,
        excerpt,
        articleUrl,
        isActive,
        order,
      } = req.body;

      if (!publisher || !String(publisher).trim()) {
        return res.status(400).json({ message: 'Publisher is required' });
      }
      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const item = new MediaPublication({
        publisher: String(publisher).trim(),
        category: category || null,
        date: date || null,
        readTime: readTime || null,
        title: String(title).trim(),
        excerpt: excerpt || null,
        image: req.file ? `/uploads/media/${req.file.filename}` : null,
        articleUrl: articleUrl || null,
        isActive: isActive === 'true' || isActive === true || isActive === undefined,
        order: order !== undefined && order !== '' ? Number(order) : 0,
      });

      const saved = await item.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// PUT /api/media-publications/:id
exports.updateMediaPublication = [
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      const existing = await MediaPublication.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Media publication not found' });
      }

      const updateData = {
        publisher:
          req.body.publisher !== undefined
            ? String(req.body.publisher).trim()
            : existing.publisher,
        category:
          req.body.category !== undefined ? req.body.category || null : existing.category,
        date: req.body.date !== undefined ? req.body.date || null : existing.date,
        readTime:
          req.body.readTime !== undefined ? req.body.readTime || null : existing.readTime,
        title:
          req.body.title !== undefined ? String(req.body.title).trim() : existing.title,
        excerpt: req.body.excerpt !== undefined ? req.body.excerpt || null : existing.excerpt,
        articleUrl:
          req.body.articleUrl !== undefined
            ? req.body.articleUrl || null
            : existing.articleUrl,
        isActive:
          req.body.isActive !== undefined
            ? req.body.isActive === 'true' || req.body.isActive === true
            : existing.isActive,
        order:
          req.body.order !== undefined && req.body.order !== ''
            ? Number(req.body.order)
            : existing.order,
      };

      if (!updateData.publisher) {
        return res.status(400).json({ message: 'Publisher is required' });
      }
      if (!updateData.title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      if (req.file) {
        deleteFileIfExists(existing.image);
        updateData.image = `/uploads/media/${req.file.filename}`;
      }

      const item = await MediaPublication.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// DELETE /api/media-publications/:id
exports.deleteMediaPublication = async (req, res) => {
  try {
    const item = await MediaPublication.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Media publication not found' });
    }

    deleteFileIfExists(item.image);
    await MediaPublication.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Media publication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/media-publications/:id/toggle-status
exports.toggleMediaPublicationStatus = async (req, res) => {
  try {
    const item = await MediaPublication.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Media publication not found' });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
