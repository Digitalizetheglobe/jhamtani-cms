const SiteUpdate = require('../models/SiteUpdate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'site-updates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_CATEGORIES = ['Residential', 'Commercial', 'Studio'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, `site-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (imageTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Site images must be JPEG, PNG, GIF, or WebP'), false);
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

const normalizeCategory = (value) => {
  if (!value) return 'Residential';
  const match = ALLOWED_CATEGORIES.find(
    (t) => t.toLowerCase() === String(value).toLowerCase()
  );
  return match || 'Residential';
};

const parseExistingImages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const mapUploadedFiles = (files = []) =>
  files.map((file) => `/uploads/site-updates/${file.filename}`);

// GET /api/site-updates
exports.getSiteUpdates = async (req, res) => {
  try {
    const { isActive, projectCategory, page = 1, limit = 50 } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (projectCategory) {
      query.projectCategory = projectCategory;
    }

    const skip = (page - 1) * limit;
    const siteUpdates = await SiteUpdate.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await SiteUpdate.countDocuments(query);

    res.status(200).json({
      siteUpdates,
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

// GET /api/site-updates/:id
exports.getSiteUpdateById = async (req, res) => {
  try {
    const item = await SiteUpdate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Site update not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/site-updates
exports.createSiteUpdate = [
  upload.array('images', 20),
  handleUploadError,
  async (req, res) => {
    try {
      const {
        projectName,
        title,
        month,
        location,
        tagline,
        projectLink,
        isActive,
        order,
      } = req.body;

      if (!projectName || !String(projectName).trim()) {
        return res.status(400).json({ message: 'Project name is required' });
      }
      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: 'Update title is required' });
      }

      const item = new SiteUpdate({
        projectName: String(projectName).trim(),
        title: String(title).trim(),
        month: month || null,
        projectCategory: normalizeCategory(req.body.projectCategory),
        location: location || null,
        tagline: tagline || null,
        projectLink: projectLink || null,
        images: mapUploadedFiles(req.files),
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

// PUT /api/site-updates/:id
exports.updateSiteUpdate = [
  upload.array('images', 20),
  handleUploadError,
  async (req, res) => {
    try {
      const existing = await SiteUpdate.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Site update not found' });
      }

      const keptImages =
        req.body.existingImages !== undefined
          ? parseExistingImages(req.body.existingImages)
          : existing.images || [];

      const oldImages = existing.images || [];
      oldImages.forEach((url) => {
        if (!keptImages.includes(url)) {
          deleteFileIfExists(url);
        }
      });

      const newImages = mapUploadedFiles(req.files);
      const images = [...keptImages, ...newImages];

      const updateData = {
        projectName:
          req.body.projectName !== undefined
            ? String(req.body.projectName).trim()
            : existing.projectName,
        title:
          req.body.title !== undefined ? String(req.body.title).trim() : existing.title,
        month: req.body.month !== undefined ? req.body.month || null : existing.month,
        projectCategory:
          req.body.projectCategory !== undefined
            ? normalizeCategory(req.body.projectCategory)
            : existing.projectCategory,
        location:
          req.body.location !== undefined ? req.body.location || null : existing.location,
        tagline:
          req.body.tagline !== undefined ? req.body.tagline || null : existing.tagline,
        projectLink:
          req.body.projectLink !== undefined
            ? req.body.projectLink || null
            : existing.projectLink,
        images,
        isActive:
          req.body.isActive !== undefined
            ? req.body.isActive === 'true' || req.body.isActive === true
            : existing.isActive,
        order:
          req.body.order !== undefined && req.body.order !== ''
            ? Number(req.body.order)
            : existing.order,
      };

      if (!updateData.projectName) {
        return res.status(400).json({ message: 'Project name is required' });
      }
      if (!updateData.title) {
        return res.status(400).json({ message: 'Update title is required' });
      }

      const item = await SiteUpdate.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// DELETE /api/site-updates/:id
exports.deleteSiteUpdate = async (req, res) => {
  try {
    const item = await SiteUpdate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Site update not found' });
    }

    (item.images || []).forEach(deleteFileIfExists);
    await SiteUpdate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Site update deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/site-updates/:id/toggle-status
exports.toggleSiteUpdateStatus = async (req, res) => {
  try {
    const item = await SiteUpdate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Site update not found' });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
