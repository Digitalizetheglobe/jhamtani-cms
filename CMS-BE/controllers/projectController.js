const Project = require('../models/Project');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/projects directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'projects');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanExt = path.extname(file.originalname).toLowerCase();
    cb(null, `project-${file.fieldname}-${uniqueSuffix}${cleanExt}`);
  },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: JPG, PNG, GIF, WebP, SVG'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Middleware for single project image upload
const uploadProjectImage = upload.single('image');

// Helper to format file url
const formatFileUrl = (filename) => {
  return `/uploads/projects/${filename}`;
};

// @desc    Get all projects (Website public list & Admin list)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { category, isActive, search, page, limit } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category.trim().toLowerCase();
    }

    if (isActive !== undefined && isActive !== 'all') {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
        { naStatus: { $regex: search, $options: 'i' } },
        { plotSize: { $regex: search, $options: 'i' } },
      ];
    }

    // Default pagination or return all
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 100;
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message,
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message,
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
  try {
    const {
      title,
      location,
      status,
      plotSize,
      naStatus,
      pageLink,
      category,
      isActive,
      order,
      imageUrl,
    } = req.body;

    if (!title || !location) {
      return res.status(400).json({
        success: false,
        message: 'Project title and location are required',
      });
    }

    let image = imageUrl || '';
    if (req.file) {
      image = formatFileUrl(req.file.filename);
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Project image is required',
      });
    }

    const newProject = new Project({
      title: title.trim(),
      location: location.trim(),
      image,
      status: status ? status.trim() : title.trim(),
      plotSize: plotSize ? plotSize.trim() : '',
      naStatus: naStatus ? naStatus.trim() : '',
      pageLink: pageLink ? pageLink.trim() : '',
      category: category ? category.trim().toLowerCase() : 'na-plots',
      isActive: isActive === undefined ? true : isActive === 'true' || isActive === true,
      order: order !== undefined && order !== '' ? Number(order) : 0,
    });

    const savedProject = await newProject.save();
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message,
    });
  }
};

// @desc    Update existing project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const {
      title,
      location,
      status,
      plotSize,
      naStatus,
      pageLink,
      category,
      isActive,
      order,
      imageUrl,
    } = req.body;

    if (title) project.title = title.trim();
    if (location) project.location = location.trim();
    if (status !== undefined) project.status = status.trim();
    if (plotSize !== undefined) project.plotSize = plotSize.trim();
    if (naStatus !== undefined) project.naStatus = naStatus.trim();
    if (pageLink !== undefined) project.pageLink = pageLink.trim();
    if (category) project.category = category.trim().toLowerCase();
    if (isActive !== undefined) project.isActive = isActive === 'true' || isActive === true;
    if (order !== undefined) project.order = order !== '' ? Number(order) : 0;

    if (imageUrl) {
      project.image = imageUrl;
    }

    if (req.file) {
      // Clean up old local image if applicable
      if (project.image && project.image.startsWith('/uploads/projects/')) {
        const oldFilePath = path.join(__dirname, '..', project.image);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (e) {
            console.warn('Could not remove old project image:', e.message);
          }
        }
      }
      project.image = formatFileUrl(req.file.filename);
    }

    const updatedProject = await project.save();
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message,
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.image && project.image.startsWith('/uploads/projects/')) {
      const filePath = path.join(__dirname, '..', project.image);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete project image:', e.message);
        }
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message,
    });
  }
};

// @desc    Toggle active status
// @route   PATCH /api/projects/:id/toggle-status
// @access  Admin
const toggleProjectStatus = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.isActive = !project.isActive;
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project status set to ${project.isActive ? 'Active' : 'Inactive'}`,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle status',
      error: error.message,
    });
  }
};

module.exports = {
  uploadProjectImage,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectStatus,
};
