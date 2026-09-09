const ProjectLocation = require('../models/ProjectLocation');

const ALLOWED_TYPES = ['Residential', 'Commercial', 'Studio'];

const normalizeType = (value) => {
  if (!value) return 'Residential';
  const match = ALLOWED_TYPES.find((t) => t.toLowerCase() === String(value).toLowerCase());
  return match || 'Residential';
};

// GET /api/project-locations
exports.getProjectLocations = async (req, res) => {
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
    const locations = await ProjectLocation.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await ProjectLocation.countDocuments(query);

    res.status(200).json({
      locations,
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

// GET /api/project-locations/:id
exports.getProjectLocationById = async (req, res) => {
  try {
    const location = await ProjectLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Project location not found' });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/project-locations
exports.createProjectLocation = async (req, res) => {
  try {
    const { projectName, location, tagline, locationUrl, isActive, order } = req.body;

    if (!projectName || !String(projectName).trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const item = new ProjectLocation({
      projectName: String(projectName).trim(),
      projectType: normalizeType(req.body.projectType),
      location: location || null,
      tagline: tagline || null,
      locationUrl: locationUrl || null,
      isActive: isActive === 'true' || isActive === true || isActive === undefined,
      order: order !== undefined && order !== '' ? Number(order) : 0,
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/project-locations/:id
exports.updateProjectLocation = async (req, res) => {
  try {
    const existing = await ProjectLocation.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Project location not found' });
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
      location: req.body.location !== undefined ? req.body.location || null : existing.location,
      tagline: req.body.tagline !== undefined ? req.body.tagline || null : existing.tagline,
      locationUrl:
        req.body.locationUrl !== undefined
          ? req.body.locationUrl || null
          : existing.locationUrl,
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

    const item = await ProjectLocation.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/project-locations/:id
exports.deleteProjectLocation = async (req, res) => {
  try {
    const item = await ProjectLocation.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Project location not found' });
    }

    await ProjectLocation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Project location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/project-locations/:id/toggle-status
exports.toggleProjectLocationStatus = async (req, res) => {
  try {
    const item = await ProjectLocation.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Project location not found' });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
