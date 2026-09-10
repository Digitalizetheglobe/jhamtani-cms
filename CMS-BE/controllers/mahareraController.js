const Maharera = require('../models/Maharera');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'maharera');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_TYPES = ['Residential', 'Commercial', 'Studio'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'projectImage' ? 'image' : 'doc';
    cb(null, `maharera-${prefix}-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'projectImage') {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (imageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Project image must be JPEG, PNG, GIF, or WebP'), false);
  }

  if (file.fieldname === 'document') {
    const docTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (docTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(null, true);
    }
    return cb(new Error('Maharera document must be a PDF or Word file'), false);
  }

  cb(new Error('Unexpected file field'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 },
});

const uploadFields = upload.fields([
  { name: 'projectImage', maxCount: 1 },
  { name: 'document', maxCount: 1 },
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

const normalizeType = (value) => {
  if (!value) return 'Residential';
  const match = ALLOWED_TYPES.find((t) => t.toLowerCase() === String(value).toLowerCase());
  return match || 'Residential';
};

const getUploaded = (req, field) => {
  if (req.files && req.files[field] && req.files[field][0]) {
    return `/uploads/maharera/${req.files[field][0].filename}`;
  }
  return null;
};

// GET /api/mahareras
exports.getMahareras = async (req, res) => {
  try {
    const { isActive, projectType, page = 1, limit = 50 } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (projectType) {
      query.projectType = projectType;
    }

    const skip = (page - 1) * limit;
    const mahareras = await Maharera.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Maharera.countDocuments(query);

    res.status(200).json({
      mahareras,
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

// GET /api/mahareras/:id
exports.getMahareraById = async (req, res) => {
  try {
    const item = await Maharera.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Maharera record not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/mahareras
exports.createMaharera = [
  uploadFields,
  handleUploadError,
  async (req, res) => {
    try {
      const { projectName, projectLocation, tagline, mahareraNo, isActive, order } = req.body;

      if (!projectName || !String(projectName).trim()) {
        return res.status(400).json({ message: 'Project name is required' });
      }

      const documentUrl = getUploaded(req, 'document');
      if (!documentUrl) {
        return res.status(400).json({ message: 'Maharera document is required' });
      }

      const item = new Maharera({
        projectName: String(projectName).trim(),
        projectType: normalizeType(req.body.projectType),
        projectLocation: projectLocation || null,
        tagline: tagline || null,
        mahareraNo: mahareraNo || null,
        projectImage: getUploaded(req, 'projectImage'),
        mahareraDocument: documentUrl,
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

// PUT /api/mahareras/:id
exports.updateMaharera = [
  uploadFields,
  handleUploadError,
  async (req, res) => {
    try {
      const existing = await Maharera.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Maharera record not found' });
      }

      const updateData = {
        projectName:
          req.body.projectName !== undefined
            ? String(req.body.projectName).trim()
            : existing.projectName,
        projectType:
          req.body.projectType !== undefined
            ? normalizeType(req.body.projectType)
            : existing.projectType,
        projectLocation:
          req.body.projectLocation !== undefined
            ? req.body.projectLocation || null
            : existing.projectLocation,
        tagline: req.body.tagline !== undefined ? req.body.tagline || null : existing.tagline,
        mahareraNo:
          req.body.mahareraNo !== undefined ? req.body.mahareraNo || null : existing.mahareraNo,
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

      const imageUrl = getUploaded(req, 'projectImage');
      if (imageUrl) {
        deleteFileIfExists(existing.projectImage);
        updateData.projectImage = imageUrl;
      }

      const documentUrl = getUploaded(req, 'document');
      if (documentUrl) {
        deleteFileIfExists(existing.mahareraDocument);
        updateData.mahareraDocument = documentUrl;
      }

      const item = await Maharera.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// DELETE /api/mahareras/:id
exports.deleteMaharera = async (req, res) => {
  try {
    const item = await Maharera.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Maharera record not found' });
    }

    deleteFileIfExists(item.projectImage);
    deleteFileIfExists(item.mahareraDocument);
    await Maharera.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Maharera record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/mahareras/:id/toggle-status
exports.toggleMahareraStatus = async (req, res) => {
  try {
    const item = await Maharera.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Maharera record not found' });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
