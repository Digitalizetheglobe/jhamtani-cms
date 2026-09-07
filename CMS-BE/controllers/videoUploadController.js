const VideoUpload = require('../models/VideoUpload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'videos');
console.log('Video uploads directory:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created video uploads directory');
} else {
  console.log('Video uploads directory already exists');
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `video-${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow only video files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4, AVI, MOV, WMV, FLV, and WebM files are allowed'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 500 }, // Limit file size to 500MB
});

// Get all video uploads
// GET /api/video-uploads
exports.getVideoUploads = async (req, res) => {
  try {
    const { isActive, category, isPublic, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }
    
    const skip = (page - 1) * limit;
    const videos = await VideoUpload.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await VideoUpload.countDocuments(query);
    
    res.status(200).json({
      videos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single video upload by ID
// GET /api/video-uploads/:id
exports.getVideoUploadById = async (req, res) => {
  try {
    const video = await VideoUpload.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video upload not found' });
    }
    
    // Increment views
    video.views += 1;
    await video.save();
    
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new video upload
// POST /api/video-uploads
exports.createVideoUpload = [
  upload.single('video'),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    try {
      const { title, description, thumbnailUrl, duration, format, resolution, category, tags, isActive, order, isPublic } = req.body;
      
      let videoUrl = '';
      if (req.file) {
        videoUrl = `/uploads/videos/${req.file.filename}`;
        console.log('Video uploaded:', req.file.filename);
        console.log('Video URL:', videoUrl);
      } else {
        console.log('No video file uploaded');
      }
      
      const video = new VideoUpload({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration: duration || 0,
        fileSize: req.file ? req.file.size : null,
        format: format || (req.file ? req.file.mimetype : null),
        resolution,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isActive: isActive === 'true' || isActive === true,
        order: order || 0,
        uploadedBy: req.body.uploadedBy || 'Admin',
        isPublic: isPublic === 'true' || isPublic === true
      });
      
      const savedVideo = await video.save();
      res.status(201).json(savedVideo);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

// Update video upload
// PUT /api/video-uploads/:id
exports.updateVideoUpload = [
  upload.single('video'),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    try {
      const { title, description, thumbnailUrl, duration, format, resolution, category, tags, isActive, order, isPublic } = req.body;
      
      const updateData = {
        title,
        description,
        thumbnailUrl,
        duration: duration || 0,
        format: format || (req.file ? req.file.mimetype : null),
        resolution,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isActive: isActive === 'true' || isActive === true,
        order: order || 0,
        isPublic: isPublic === 'true' || isPublic === true
      };
      
      // If new video is uploaded, update videoUrl and file info
      if (req.file) {
        updateData.videoUrl = `/uploads/videos/${req.file.filename}`;
        updateData.fileSize = req.file.size;
      }
      
      const video = await VideoUpload.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!video) {
        return res.status(404).json({ message: 'Video upload not found' });
      }
      
      res.status(200).json(video);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

// Delete video upload
// DELETE /api/video-uploads/:id
exports.deleteVideoUpload = async (req, res) => {
  try {
    const video = await VideoUpload.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video upload not found' });
    }
    
    // Delete the video file from server
    if (video.videoUrl) {
      const videoPath = path.join(__dirname, '..', video.videoUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    
    await VideoUpload.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Video upload deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle active status
// PATCH /api/video-uploads/:id/toggle-status
exports.toggleVideoUploadStatus = async (req, res) => {
  try {
    const video = await VideoUpload.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video upload not found' });
    }
    
    video.isActive = !video.isActive;
    const updatedVideo = await video.save();
    
    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle public status
// PATCH /api/video-uploads/:id/toggle-public
exports.toggleVideoUploadPublic = async (req, res) => {
  try {
    const video = await VideoUpload.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video upload not found' });
    }
    
    video.isPublic = !video.isPublic;
    const updatedVideo = await video.save();
    
    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
