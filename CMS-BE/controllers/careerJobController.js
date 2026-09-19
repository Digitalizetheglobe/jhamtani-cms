const CareerJob = require('../models/CareerJob');

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship'];

const parseStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const normalizeSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

// GET /api/career-jobs
exports.getCareerJobs = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const jobs = await CareerJob.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await CareerJob.countDocuments(query);

    res.status(200).json({
      jobs,
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

// GET /api/career-jobs/:id
exports.getCareerJobById = async (req, res) => {
  try {
    const item = await CareerJob.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/career-jobs
exports.createCareerJob = async (req, res) => {
  try {
    const {
      slug,
      title,
      department,
      location,
      type,
      experience,
      description,
      responsibilities,
      requirements,
      isActive,
      order,
    } = req.body;

    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) {
      return res.status(400).json({ message: 'Job ID is required' });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Job title is required' });
    }
    if (!department || !String(department).trim()) {
      return res.status(400).json({ message: 'Department is required' });
    }
    if (!location || !String(location).trim()) {
      return res.status(400).json({ message: 'Location is required' });
    }
    if (!experience || !String(experience).trim()) {
      return res.status(400).json({ message: 'Experience is required' });
    }
    if (!description || !String(description).trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const existing = await CareerJob.findOne({ slug: normalizedSlug });
    if (existing) {
      return res.status(400).json({ message: 'A job with this ID already exists' });
    }

    const jobType = JOB_TYPES.includes(type) ? type : 'Full Time';
    const respList = parseStringArray(responsibilities);
    const reqList = parseStringArray(requirements);

    if (!respList.length) {
      return res.status(400).json({ message: 'At least one responsibility is required' });
    }
    if (!reqList.length) {
      return res.status(400).json({ message: 'At least one requirement is required' });
    }

    const item = new CareerJob({
      slug: normalizedSlug,
      title: String(title).trim(),
      department: String(department).trim(),
      location: String(location).trim(),
      type: jobType,
      experience: String(experience).trim(),
      description: String(description).trim(),
      responsibilities: respList,
      requirements: reqList,
      isActive: isActive === 'false' || isActive === false ? false : true,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/career-jobs/:id
exports.updateCareerJob = async (req, res) => {
  try {
    const existing = await CareerJob.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updateData = {
      title:
        req.body.title !== undefined ? String(req.body.title).trim() : existing.title,
      department:
        req.body.department !== undefined
          ? String(req.body.department).trim()
          : existing.department,
      location:
        req.body.location !== undefined
          ? String(req.body.location).trim()
          : existing.location,
      type:
        req.body.type !== undefined && JOB_TYPES.includes(req.body.type)
          ? req.body.type
          : existing.type,
      experience:
        req.body.experience !== undefined
          ? String(req.body.experience).trim()
          : existing.experience,
      description:
        req.body.description !== undefined
          ? String(req.body.description).trim()
          : existing.description,
      isActive:
        req.body.isActive !== undefined
          ? req.body.isActive === 'true' || req.body.isActive === true
          : existing.isActive,
      order:
        req.body.order !== undefined && Number.isFinite(Number(req.body.order))
          ? Number(req.body.order)
          : existing.order,
    };

    if (req.body.slug !== undefined) {
      const normalizedSlug = normalizeSlug(req.body.slug);
      if (!normalizedSlug) {
        return res.status(400).json({ message: 'Job ID is required' });
      }
      const duplicate = await CareerJob.findOne({ slug: normalizedSlug });
      if (duplicate && duplicate._id !== existing._id) {
        return res.status(400).json({ message: 'A job with this ID already exists' });
      }
      updateData.slug = normalizedSlug;
    }

    if (req.body.responsibilities !== undefined) {
      updateData.responsibilities = parseStringArray(req.body.responsibilities);
      if (!updateData.responsibilities.length) {
        return res.status(400).json({ message: 'At least one responsibility is required' });
      }
    }

    if (req.body.requirements !== undefined) {
      updateData.requirements = parseStringArray(req.body.requirements);
      if (!updateData.requirements.length) {
        return res.status(400).json({ message: 'At least one requirement is required' });
      }
    }

    if (!updateData.title) {
      return res.status(400).json({ message: 'Job title is required' });
    }
    if (!updateData.department) {
      return res.status(400).json({ message: 'Department is required' });
    }
    if (!updateData.location) {
      return res.status(400).json({ message: 'Location is required' });
    }
    if (!updateData.experience) {
      return res.status(400).json({ message: 'Experience is required' });
    }
    if (!updateData.description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const item = await CareerJob.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/career-jobs/:id
exports.deleteCareerJob = async (req, res) => {
  try {
    const item = await CareerJob.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await CareerJob.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
