const Brochure = require('../models/Brochure');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'brochures');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_TITLES = ['Residential', 'Commercial', 'Studio'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'logo' ? 'logo' : 'brochure';
    cb(null, `${prefix}-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'logo') {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (imageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Project logo must be JPEG, PNG, GIF, or WebP'), false);
  }

  if (file.fieldname === 'brochure') {
    const docTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (docTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(null, true);
    }
    return cb(new Error('Brochure must be a PDF or Word document'), false);
  }

  cb(new Error('Unexpected file field'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 },
});

const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'brochure', maxCount: 1 },
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

const normalizeTitle = (value) => {
  if (!value) return 'Residential';
  const match = ALLOWED_TITLES.find((t) => t.toLowerCase() === String(value).toLowerCase());
  return match || 'Residential';
};

const getUploaded = (req, field) => {
  if (req.files && req.files[field] && req.files[field][0]) {
    return `/uploads/brochures/${req.files[field][0].filename}`;
  }
  return null;
};

// GET /api/brochures
exports.getBrochures = async (req, res) => {
  try {
    const { isActive, projectTitle, page = 1, limit = 50 } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (projectTitle) {
      query.projectTitle = projectTitle;
    }

    const skip = (page - 1) * limit;
    const brochures = await Brochure.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Brochure.countDocuments(query);

    res.status(200).json({
      brochures,
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

// GET /api/brochures/:id
exports.getBrochureById = async (req, res) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure) {
      return res.status(404).json({ message: 'Brochure not found' });
    }
    res.status(200).json(brochure);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/brochures
exports.createBrochure = [
  uploadFields,
  handleUploadError,
  async (req, res) => {
    try {
      const { projectName, location, tagline, projectPageUrl, isActive, order } = req.body;

      if (!projectName || !String(projectName).trim()) {
        return res.status(400).json({ message: 'Project name is required' });
      }

      const logoUrl = getUploaded(req, 'logo');
      const brochureUrl = getUploaded(req, 'brochure');

      if (!brochureUrl) {
        return res.status(400).json({ message: 'Brochure document is required' });
      }

      const brochure = new Brochure({
        projectName: String(projectName).trim(),
        projectLogo: logoUrl,
        projectTitle: normalizeTitle(req.body.projectTitle),
        location: location || null,
        tagline: tagline || null,
        projectPageUrl: projectPageUrl || null,
        brochureDocument: brochureUrl,
        isActive: isActive === 'true' || isActive === true || isActive === undefined,
        order: order !== undefined && order !== '' ? Number(order) : 0,
      });

      const saved = await brochure.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// PUT /api/brochures/:id
exports.updateBrochure = [
  uploadFields,
  handleUploadError,
  async (req, res) => {
    try {
      const existing = await Brochure.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Brochure not found' });
      }

      const updateData = {
        projectName:
          req.body.projectName !== undefined
            ? String(req.body.projectName).trim()
            : existing.projectName,
        projectTitle:
          req.body.projectTitle !== undefined
            ? normalizeTitle(req.body.projectTitle)
            : existing.projectTitle,
        location: req.body.location !== undefined ? req.body.location || null : existing.location,
        tagline: req.body.tagline !== undefined ? req.body.tagline || null : existing.tagline,
        projectPageUrl:
          req.body.projectPageUrl !== undefined
            ? req.body.projectPageUrl || null
            : existing.projectPageUrl,
        isActive:
          req.body.isActive !== undefined
            ? req.body.isActive === 'true' || req.body.isActive === true
            : existing.isActive,
        order:
          req.body.order !== undefined && req.body.order !== ''
            ? Number(req.body.order)
            : existing.order,
      };

      const logoUrl = getUploaded(req, 'logo');
      if (logoUrl) {
        deleteFileIfExists(existing.projectLogo);
        updateData.projectLogo = logoUrl;
      }

      const brochureUrl = getUploaded(req, 'brochure');
      if (brochureUrl) {
        deleteFileIfExists(existing.brochureDocument);
        updateData.brochureDocument = brochureUrl;
      }

      if (!updateData.projectName) {
        return res.status(400).json({ message: 'Project name is required' });
      }

      const brochure = await Brochure.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(brochure);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// DELETE /api/brochures/:id
exports.deleteBrochure = async (req, res) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure) {
      return res.status(404).json({ message: 'Brochure not found' });
    }

    deleteFileIfExists(brochure.projectLogo);
    deleteFileIfExists(brochure.brochureDocument);

    await Brochure.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Brochure deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/brochures/:id/toggle-status
exports.toggleBrochureStatus = async (req, res) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure) {
      return res.status(404).json({ message: 'Brochure not found' });
    }

    brochure.isActive = !brochure.isActive;
    await brochure.save();

    res.status(200).json({ success: true, data: brochure });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
