const YouTubeVideo = require('../models/YouTubeVideo');

// Get all YouTube videos
exports.getAllYouTubeVideos = async (req, res) => {
  try {
    const videos = await YouTubeVideo.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active YouTube videos only
exports.getActiveYouTubeVideos = async (req, res) => {
  try {
    const videos = await YouTubeVideo.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get YouTube video by ID
exports.getYouTubeVideoById = async (req, res) => {
  try {
    const video = await YouTubeVideo.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'YouTube video not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new YouTube video
exports.createYouTubeVideo = async (req, res) => {
  try {
    const { name, description, url, isActive } = req.body;
    
    const newVideo = new YouTubeVideo({
      name,
      description,
      url,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user ? req.user._id : null
    });
    
    const savedVideo = await newVideo.save();
    
    res.status(201).json({
      success: true,
      data: savedVideo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update YouTube video
exports.updateYouTubeVideo = async (req, res) => {
  try {
    const { name, description, url, isActive } = req.body;
    
    // Find existing video
    const existingVideo = await YouTubeVideo.findById(req.params.id);
    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'YouTube video not found'
      });
    }
    
    const updatedVideo = await YouTubeVideo.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        url,
        isActive,
        updatedBy: req.user ? req.user._id : null
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedVideo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete YouTube video
exports.deleteYouTubeVideo = async (req, res) => {
  try {
    const video = await YouTubeVideo.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'YouTube video not found'
      });
    }
    
    await YouTubeVideo.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'YouTube video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle active status
exports.toggleActiveStatus = async (req, res) => {
  try {
    const video = await YouTubeVideo.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'YouTube video not found'
      });
    }
    
    video.isActive = !video.isActive;
    video.updatedBy = req.user ? req.user._id : null;
    
    const updatedVideo = await video.save();
    
    res.status(200).json({
      success: true,
      data: updatedVideo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
