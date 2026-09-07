const GalleryPhoto = require('../models/GalleryPhoto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'gallery');
console.log('Gallery uploads directory:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created gallery uploads directory');
} else {
  console.log('Gallery uploads directory already exists');
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `gallery-${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP files are allowed'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 100 }, // Limit file size to 100MB
});

// Get allowed categories
// GET /api/gallery-photos/categories
exports.getGalleryCategories = async (req, res) => {
  try {
    const categories = GalleryPhoto.getAllowedCategories();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all gallery photos
// GET /api/gallery-photos
exports.getGalleryPhotos = async (req, res) => {
  try {
    const { isActive, category, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    const photos = await GalleryPhoto.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await GalleryPhoto.countDocuments(query);
    
    res.status(200).json({
      photos,
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

// Get single gallery photo by ID
// GET /api/gallery-photos/:id
exports.getGalleryPhotoById = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Gallery photo not found' });
    }
    
    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new gallery photo
// POST /api/gallery-photos
exports.createGalleryPhoto = [
  upload.single('image'),
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
      console.log('=== Gallery Photo Create Request ===');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      const { title, description, altText, category, tags, isActive, order } = req.body;
      
      // Validate required fields
      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
      }
      
      if (!category) {
        return res.status(400).json({ message: 'Category is required' });
      }
      
      // Check if category is valid
      const allowedCategories = GalleryPhoto.getAllowedCategories();
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ message: `Invalid category. Allowed categories: ${allowedCategories.join(', ')}` });
      }
      
      let imageUrl = '';
      if (req.file) {
        imageUrl = `/uploads/gallery/${req.file.filename}`;
        console.log('File uploaded:', req.file.filename);
        console.log('Image URL:', imageUrl);
      }
      
      // For the specified categories, title and description are optional
      const photo = new GalleryPhoto({
        title: title || '',
        description: description || '',
        imageUrl,
        altText: altText || '',
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isActive: isActive === 'true' || isActive === true,
        order: order || 0,
        uploadedBy: req.body.uploadedBy || 'Admin',
        fileSize: req.file ? req.file.size : null,
        dimensions: {
          width: req.body.width,
          height: req.body.height
        }
      });
      
      const savedPhoto = await photo.save();
      res.status(201).json(savedPhoto);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

// Update gallery photo
// PUT /api/gallery-photos/:id
exports.updateGalleryPhoto = [
  upload.single('image'),
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
      const { title, description, altText, category, tags, isActive, order } = req.body;
      
      // If category is provided, validate it
      if (category) {
        const allowedCategories = GalleryPhoto.getAllowedCategories();
        if (!allowedCategories.includes(category)) {
          return res.status(400).json({ message: `Invalid category. Allowed categories: ${allowedCategories.join(', ')}` });
        }
      }
      
      const updateData = {
        title: title || '',
        description: description || '',
        altText: altText || '',
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isActive: isActive === 'true' || isActive === true,
        order: order || 0
      };
      
      // If new image is uploaded, update imageUrl and file info
      if (req.file) {
        updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
        updateData.fileSize = req.file.size;
        updateData.dimensions = {
          width: req.body.width,
          height: req.body.height
        };
      }
      
      const photo = await GalleryPhoto.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!photo) {
        return res.status(404).json({ message: 'Gallery photo not found' });
      }
      
      res.status(200).json(photo);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

// Delete gallery photo
// DELETE /api/gallery-photos/:id
exports.deleteGalleryPhoto = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Gallery photo not found' });
    }
    
    // Delete the image file from server
    if (photo.imageUrl) {
      const imagePath = path.join(__dirname, '..', photo.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await GalleryPhoto.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Gallery photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle active status
// PATCH /api/gallery-photos/:id/toggle-status
exports.toggleGalleryPhotoStatus = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Gallery photo not found' });
    }
    
    photo.isActive = !photo.isActive;
    const updatedPhoto = await photo.save();
    
    res.status(200).json(updatedPhoto);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Category-specific endpoints for easier API calls

// Upload festival photo
// POST /api/gallery-photos/festivals
exports.uploadFestivalPhoto = [
  upload.single('image'),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    req.body.category = 'festivals';
    return exports.createGalleryPhoto[2](req, res);
  }
];

// Upload exhibition photo
// POST /api/gallery-photos/exhibitions
exports.uploadExhibitionPhoto = [
  upload.single('image'),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    req.body.category = 'exhibitions';
    return exports.createGalleryPhoto[2](req, res);
  }
];

// Upload outing photo
// POST /api/gallery-photos/outings
exports.uploadOutingPhoto = [
  upload.single('image'),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    req.body.category = 'outings';
    return exports.createGalleryPhoto[2](req, res);
  }
];

// Upload happy client photo
// POST /api/gallery-photos/happy-clients
exports.uploadHappyClientPhoto = [
  upload.single('image'),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(400).json({ message: 'File validation error', error: err.message });
    }
    next();
  },
  async (req, res) => {
    req.body.category = 'happy clients';
    return exports.createGalleryPhoto[2](req, res);
  }
];

// Get photos by category

// Get festival photos
// GET /api/gallery-photos/festivals
exports.getFestivalPhotos = async (req, res) => {
  req.query.category = 'festivals';
  return exports.getGalleryPhotos(req, res);
};

// Get exhibition photos
// GET /api/gallery-photos/exhibitions
exports.getExhibitionPhotos = async (req, res) => {
  req.query.category = 'exhibitions';
  return exports.getGalleryPhotos(req, res);
};

// Get outing photos
// GET /api/gallery-photos/outings
exports.getOutingPhotos = async (req, res) => {
  req.query.category = 'outings';
  return exports.getGalleryPhotos(req, res);
};

// Get happy client photos
// GET /api/gallery-photos/happy-clients
exports.getHappyClientPhotos = async (req, res) => {
  req.query.category = 'happy clients';
  return exports.getGalleryPhotos(req, res);
};
