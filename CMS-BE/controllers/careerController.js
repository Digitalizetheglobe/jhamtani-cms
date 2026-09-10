const CareerApplication = require('../models/CareerApplication');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'careers');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_STATUSES = ['new', 'reviewed', 'shortlisted', 'rejected'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, `resume-${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const name = (file.originalname || '').toLowerCase();
  if (
    allowedTypes.includes(file.mimetype) ||
    name.endsWith('.pdf') ||
    name.endsWith('.doc') ||
    name.endsWith('.docx')
  ) {
    return cb(null, true);
  }
  cb(new Error('Resume must be PDF, DOC, or DOCX'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
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

const normalizeStatus = (value) => {
  if (!value) return 'new';
  const match = ALLOWED_STATUSES.find((s) => s === String(value).toLowerCase());
  return match || 'new';
};

// GET /api/careers
exports.getCareerApplications = async (req, res) => {
  try {
    const { status, isActive, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const applications = await CareerApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await CareerApplication.countDocuments(query);

    res.status(200).json({
      applications,
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

// GET /api/careers/:id
exports.getCareerApplicationById = async (req, res) => {
  try {
    const item = await CareerApplication.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/careers
exports.createCareerApplication = [
  upload.single('resume'),
  handleUploadError,
  async (req, res) => {
    try {
      const {
        positionApplyingFor,
        fullName,
        email,
        phone,
        experienceYears,
        linkedinUrl,
        briefNote,
        consent,
        status,
        isActive,
      } = req.body;

      if (!positionApplyingFor || !String(positionApplyingFor).trim()) {
        return res.status(400).json({ message: 'Position applying for is required' });
      }
      if (!fullName || !String(fullName).trim()) {
        return res.status(400).json({ message: 'Full name is required' });
      }
      if (!email || !String(email).trim()) {
        return res.status(400).json({ message: 'Email address is required' });
      }
      if (!phone || !String(phone).trim()) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      if (!experienceYears || !String(experienceYears).trim()) {
        return res.status(400).json({ message: 'Experience is required' });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'Resume / CV is required' });
      }

      const item = new CareerApplication({
        positionApplyingFor: String(positionApplyingFor).trim(),
        fullName: String(fullName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        experienceYears: String(experienceYears).trim(),
        linkedinUrl: linkedinUrl || null,
        resumeUrl: `/uploads/careers/${req.file.filename}`,
        briefNote: briefNote || null,
        consent: consent === 'true' || consent === true,
        status: normalizeStatus(status),
        isActive: isActive === 'true' || isActive === true || isActive === undefined,
      });

      const saved = await item.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// PUT /api/careers/:id
exports.updateCareerApplication = [
  upload.single('resume'),
  handleUploadError,
  async (req, res) => {
    try {
      const existing = await CareerApplication.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Application not found' });
      }

      const updateData = {
        positionApplyingFor:
          req.body.positionApplyingFor !== undefined
            ? String(req.body.positionApplyingFor).trim()
            : existing.positionApplyingFor,
        fullName:
          req.body.fullName !== undefined
            ? String(req.body.fullName).trim()
            : existing.fullName,
        email:
          req.body.email !== undefined
            ? String(req.body.email).trim().toLowerCase()
            : existing.email,
        phone:
          req.body.phone !== undefined ? String(req.body.phone).trim() : existing.phone,
        experienceYears:
          req.body.experienceYears !== undefined
            ? String(req.body.experienceYears).trim()
            : existing.experienceYears,
        linkedinUrl:
          req.body.linkedinUrl !== undefined
            ? req.body.linkedinUrl || null
            : existing.linkedinUrl,
        briefNote:
          req.body.briefNote !== undefined ? req.body.briefNote || null : existing.briefNote,
        consent:
          req.body.consent !== undefined
            ? req.body.consent === 'true' || req.body.consent === true
            : existing.consent,
        status:
          req.body.status !== undefined
            ? normalizeStatus(req.body.status)
            : existing.status,
        isActive:
          req.body.isActive !== undefined
            ? req.body.isActive === 'true' || req.body.isActive === true
            : existing.isActive,
      };

      if (!updateData.positionApplyingFor) {
        return res.status(400).json({ message: 'Position applying for is required' });
      }
      if (!updateData.fullName) {
        return res.status(400).json({ message: 'Full name is required' });
      }
      if (!updateData.email) {
        return res.status(400).json({ message: 'Email address is required' });
      }
      if (!updateData.phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      if (!updateData.experienceYears) {
        return res.status(400).json({ message: 'Experience is required' });
      }

      if (req.file) {
        deleteFileIfExists(existing.resumeUrl);
        updateData.resumeUrl = `/uploads/careers/${req.file.filename}`;
      }

      const item = await CareerApplication.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
];

// DELETE /api/careers/:id
exports.deleteCareerApplication = async (req, res) => {
  try {
    const item = await CareerApplication.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Application not found' });
    }

    deleteFileIfExists(item.resumeUrl);
    await CareerApplication.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/careers/:id/status
exports.updateCareerApplicationStatus = async (req, res) => {
  try {
    const item = await CareerApplication.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Application not found' });
    }

    item.status = normalizeStatus(req.body.status);
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
