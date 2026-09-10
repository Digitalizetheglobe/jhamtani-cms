const Newsletter = require('../models/Newsletter');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'newsletters');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'coverImage' ? 'cover' : 'pdf';
    cb(null, `newsletter-${prefix}-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage') {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (imageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Cover photo must be JPEG, PNG, GIF, or WebP'), false);
  }

  if (file.fieldname === 'pdfDocument') {
    if (
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    ) {
      return cb(null, true);
    }
    return cb(new Error('Newsletter file must be a PDF'), false);
  }

  cb(new Error('Unexpected file field'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 },
});

const uploadFields = upload.fields([
  { name: 'pdfDocument', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

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

const getUploaded = (req, field) => {
  if (req.files && req.files[field] && req.files[field][0]) {
    return `/uploads/newsletters/${req.files[field][0].filename}`;
  }
  return null;
};

const parseYear = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const year = Number(value);
  return Number.isFinite(year) ? year : null;
};

// GET /api/newsletters
exports.getNewsletters = async (req, res) => {
  try {
    const { isActive, year, month, page = 1, limit = 50 } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (year) {
      query.year = Number(year);
    }
    if (month) {
      query.month = month;
    }

    const skip = (page - 1) * limit;
    const newsletters = await Newsletter.find(query)
      .sort({ order: 1, year: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Newsletter.countDocuments(query);

    res.status(200).json({
      newsletters,
      months: MONTHS,
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

// GET /api/newsletters/:id
exports.getNewsletterById = async (req, res) => {
  try {
    const item = await Newsletter.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/newsletters
exports.createNewsletter = [
  uploadFields,
  handleUploadError,
  async (req, res) => {
    try {
      const { title, month, badge, tagline, date, isActive, order } = req.body;

      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: 'Newsletter title is required' });
      }

      const pdfUrl = getUploaded(req, 'pdfDocument');
      if (!pdfUrl) {
        return res.status(400).json({ message: 'Newsletter PDF is required' });
      }

      const item = new Newsletter({
        title: String(title).trim(),
        month: month || null,
        year: parseYear(req.body.year),
        badge: badge || null,
        tagline: tagline || null,
        pdfDocument: pdfUrl,
        coverImage: getUploaded(req, 'coverImage'),
        date: date || null,
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

// PUT /api/newsletters/:id
exports.updateNewsletter = [
  uploadFields,
  handleUploadError,
  async (req, res) => {
    try {
      const existing = await Newsletter.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Newsletter not found' });
      }

      const updateData = {
        title:
          req.body.title !== undefined ? String(req.body.title).trim() : existing.title,
        month: req.body.month !== undefined ? req.body.month || null : existing.month,
        year: req.body.year !== undefined ? parseYear(req.body.year) : existing.year,
        badge: req.body.badge !== undefined ? req.body.badge || null : existing.badge,
        tagline:
          req.body.tagline !== undefined ? req.body.tagline || null : existing.tagline,
        date: req.body.date !== undefined ? req.body.date || null : existing.date,
        isActive:
          req.body.isActive !== undefined
            ? req.body.isActive === 'true' || req.body.isActive === true
            : existing.isActive,
        order:
          req.body.order !== undefined && req.body.order !== ''
            ? Number(req.body.order)
            : existing.order,
      };

      if (!updateData.title) {
        return res.status(400).json({ message: 'Newsletter title is required' });
      }

      const pdfUrl = getUploaded(req, 'pdfDocument');
      if (pdfUrl) {
        deleteFileIfExists(existing.pdfDocument);
        updateData.pdfDocument = pdfUrl;
      }

      const coverUrl = getUploaded(req, 'coverImage');
      if (coverUrl) {
        deleteFileIfExists(existing.coverImage);
        updateData.coverImage = coverUrl;
      }

      const item = await Newsletter.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// DELETE /api/newsletters/:id
exports.deleteNewsletter = async (req, res) => {
  try {
    const item = await Newsletter.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    deleteFileIfExists(item.pdfDocument);
    deleteFileIfExists(item.coverImage);
    await Newsletter.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/newsletters/:id/toggle-status
exports.toggleNewsletterStatus = async (req, res) => {
  try {
    const item = await Newsletter.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.MONTHS = MONTHS;
