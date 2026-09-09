const Award = require('../models/Award');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'awards');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, `award-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP files are allowed'), false);
  }
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

// GET /api/awards
exports.getAwards = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    const awards = await Award.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Award.countDocuments(query);

    res.status(200).json({
      awards,
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

// GET /api/awards/:id
exports.getAwardById = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);
    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }
    res.status(200).json(award);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/awards
exports.createAward = [
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Award image is required' });
      }

      const award = new Award({
        title: req.body.title || '',
        imageUrl: `/uploads/awards/${req.file.filename}`,
        isActive: req.body.isActive === 'true' || req.body.isActive === true || req.body.isActive === undefined,
        order: req.body.order !== undefined && req.body.order !== '' ? Number(req.body.order) : 0,
      });

      const saved = await award.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// PUT /api/awards/:id
exports.updateAward = [
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      const existing = await Award.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Award not found' });
      }

      const updateData = {
        title: req.body.title !== undefined ? req.body.title : existing.title,
        isActive:
          req.body.isActive !== undefined
            ? req.body.isActive === 'true' || req.body.isActive === true
            : existing.isActive,
        order:
          req.body.order !== undefined && req.body.order !== ''
            ? Number(req.body.order)
            : existing.order,
      };

      if (req.file) {
        if (existing.imageUrl) {
          const oldPath = path.join(__dirname, '..', existing.imageUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        updateData.imageUrl = `/uploads/awards/${req.file.filename}`;
      }

      const award = await Award.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(award);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// DELETE /api/awards/:id
exports.deleteAward = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);
    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    if (award.imageUrl) {
      const imagePath = path.join(__dirname, '..', award.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Award.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Award deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/awards/:id/toggle-status
exports.toggleAwardStatus = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);
    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    award.isActive = !award.isActive;
    await award.save();

    res.status(200).json({ success: true, data: award });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
