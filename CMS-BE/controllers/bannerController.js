const Banner = require('../models/Banner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/banners directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'banners');
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
    cb(null, `banner-${file.fieldname}-${uniqueSuffix}${cleanExt}`);
  },
});

// File filter (images & videos)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: JPG, PNG, GIF, WebP, SVG, MP4, WebM'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Multer upload middleware for desktop, tablet, and mobile banners
const uploadBannerFiles = upload.fields([
  { name: 'desktopBanner', maxCount: 1 },
  { name: 'tabletBanner', maxCount: 1 },
  { name: 'mobileBanner', maxCount: 1 },
]);

// Helper to format file url
const formatFileUrl = (filename) => {
  return `/uploads/banners/${filename}`;
};

// @desc    Get all banners (Admin / Public list)
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
  try {
    const { placement, isActive, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (placement && placement !== 'all') {
      query.placement = placement.trim().toLowerCase();
    }

    if (isActive !== undefined && isActive !== 'all') {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { placement: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const banners = await Banner.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Banner.countDocuments(query);

    res.status(200).json({
      success: true,
      data: banners,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners', error: error.message });
  }
};

// @desc    Get single banner by ID (Direct Form ID Style for landing pages)
// @route   GET /api/banners/:id
// @access  Public
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch banner', error: error.message });
  }
};

// @desc    Get active banner(s) by placement (Optional)
// @route   GET /api/banners/placement/:placement
// @access  Public
const getBannerByPlacement = async (req, res) => {
  try {
    const placement = req.params.placement.trim().toLowerCase();

    const banners = await Banner.find({
      placement,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (!banners || banners.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: `No active banner found for placement '${placement}'`,
      });
    }

    res.status(200).json({
      success: true,
      data: banners[0],
      allBanners: banners,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch banner by placement', error: error.message });
  }
};

// @desc    Create new banner
// @route   POST /api/banners
// @access  Admin
const createBanner = async (req, res) => {
  try {
    const {
      title,
      placement,
      description,
      isActive,
      desktopBannerUrl,
      tabletBannerUrl,
      mobileBannerUrl,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Banner Title is required' });
    }

    let desktopBanner = desktopBannerUrl || '';
    let tabletBanner = tabletBannerUrl || '';
    let mobileBanner = mobileBannerUrl || '';

    if (req.files) {
      if (req.files.desktopBanner && req.files.desktopBanner[0]) {
        desktopBanner = formatFileUrl(req.files.desktopBanner[0].filename);
      }
      if (req.files.tabletBanner && req.files.tabletBanner[0]) {
        tabletBanner = formatFileUrl(req.files.tabletBanner[0].filename);
      }
      if (req.files.mobileBanner && req.files.mobileBanner[0]) {
        mobileBanner = formatFileUrl(req.files.mobileBanner[0].filename);
      }
    }

    if (!desktopBanner) {
      return res.status(400).json({ success: false, message: 'Desktop banner image is required' });
    }

    // Auto-generate placement slug from title if not explicitly provided
    const placementSlug = placement
      ? placement.trim().toLowerCase()
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newBanner = new Banner({
      title: title.trim(),
      placement: placementSlug,
      description: description ? description.trim() : '',
      desktopBanner,
      tabletBanner: tabletBanner || desktopBanner,
      mobileBanner: mobileBanner || tabletBanner || desktopBanner,
      isActive: isActive === undefined ? true : isActive === 'true' || isActive === true,
    });

    const savedBanner = await newBanner.save();
    res.status(201).json({ success: true, message: 'Banner created successfully', data: savedBanner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create banner', error: error.message });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Admin
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const {
      title,
      placement,
      description,
      isActive,
      desktopBannerUrl,
      tabletBannerUrl,
      mobileBannerUrl,
    } = req.body;

    if (title) banner.title = title.trim();
    if (placement) banner.placement = placement.trim().toLowerCase();
    if (description !== undefined) banner.description = description ? description.trim() : '';
    if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;

    if (desktopBannerUrl) banner.desktopBanner = desktopBannerUrl;
    if (tabletBannerUrl) banner.tabletBanner = tabletBannerUrl;
    if (mobileBannerUrl) banner.mobileBanner = mobileBannerUrl;

    if (req.files) {
      if (req.files.desktopBanner && req.files.desktopBanner[0]) {
        banner.desktopBanner = formatFileUrl(req.files.desktopBanner[0].filename);
      }
      if (req.files.tabletBanner && req.files.tabletBanner[0]) {
        banner.tabletBanner = formatFileUrl(req.files.tabletBanner[0].filename);
      }
      if (req.files.mobileBanner && req.files.mobileBanner[0]) {
        banner.mobileBanner = formatFileUrl(req.files.mobileBanner[0].filename);
      }
    }

    const updatedBanner = await banner.save();
    res.status(200).json({ success: true, message: 'Banner updated successfully', data: updatedBanner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update banner', error: error.message });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const tryDeleteLocalFile = (fileUrl) => {
      if (fileUrl && fileUrl.startsWith('/uploads/banners/')) {
        const filePath = path.join(__dirname, '..', fileUrl);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('Could not delete banner file:', filePath, e.message);
          }
        }
      }
    };

    tryDeleteLocalFile(banner.desktopBanner);
    tryDeleteLocalFile(banner.tabletBanner);
    tryDeleteLocalFile(banner.mobileBanner);

    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete banner', error: error.message });
  }
};

// @desc    Toggle active status
// @route   PATCH /api/banners/:id/toggle-status
// @access  Admin
const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner status set to ${banner.isActive ? 'Active' : 'Inactive'}`,
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};

// @desc    Get all active public banners
// @route   GET /api/banners/public/all
// @access  Public
const getAllPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch public banners', error: error.message });
  }
};

module.exports = {
  uploadBannerFiles,
  getBanners,
  getBannerById,
  getBannerByPlacement,
  getAllPublicBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
};
