const HappyClient = require('../models/HappyClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'happy-clients');
console.log('Happy client uploads directory:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created happy client uploads directory');
} else {
  console.log('Happy client uploads directory already exists');
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `client-${Date.now()}-${file.originalname}`);
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

// Get all happy clients
// GET /api/happy-clients
exports.getHappyClients = async (req, res) => {
  try {
    const { isActive, category, featured, page = 1, limit = 100 } = req.query;
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    const skip = (page - 1) * limit;
    const clients = await HappyClient.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await HappyClient.countDocuments(query);
    
    res.status(200).json({
      clients,
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

// Get single happy client by ID
// GET /api/happy-clients/:id
exports.getHappyClientById = async (req, res) => {
  try {
    const client = await HappyClient.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Happy client not found' });
    }
    
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new happy client
// POST /api/happy-clients
exports.createHappyClient = [
  upload.single('photo'),
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
      console.log('Request Body:', req.body);
      console.log('Request File:', req.file);
      console.log('Content-Type:', req.headers['content-type']);
      
      const { 
        name, company, position, postRedirect, rating, website, email, phone, 
        category, tags, isActive, order, featured, linkedin, twitter, facebook 
      } = req.body;
      
      let photoUrl = '';
      if (req.file) {
        photoUrl = `/uploads/happy-clients/${req.file.filename}`;
        console.log('Client photo uploaded successfully:', req.file.filename);
        console.log('Photo URL:', photoUrl);
      } else {
        console.log('No client photo uploaded in request');
      }
      
      // Create client object with all fields (even if they're empty/null)
      const clientData = {
        name: name || '',
        company: company || '',
        position: position || '',
        photoUrl,
        postRedirect: postRedirect || '',
        rating: rating ? parseInt(rating) : null,
        website: website || '',
        email: email || '',
        phone: phone || '',
        category: category || '',
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [],
        isActive: isActive === 'true' || isActive === true || isActive === undefined ? true : false,
        order: order ? parseInt(order) : 0,
        featured: featured === 'true' || featured === true,
        socialLinks: {
          linkedin: linkedin || '',
          twitter: twitter || '',
          facebook: facebook || ''
        }
      };
      
      console.log('Creating client with data:', clientData);
      
      const client = new HappyClient(clientData);
      const savedClient = await client.save();
      
      console.log('Client saved successfully:', savedClient._id);
      res.status(201).json(savedClient);
    } catch (error) {
      console.error('Error creating happy client:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message,
        details: error.stack
      });
    }
  }
];

// Update happy client
// PUT /api/happy-clients/:id
exports.updateHappyClient = [
  upload.single('photo'),
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
      const { 
        name, company, position, postRedirect, rating, website, email, phone, 
        category, tags, isActive, order, featured, linkedin, twitter, facebook 
      } = req.body;
      
      const updateData = {
        name,
        company,
        position,
        postRedirect,
        rating: rating ? parseInt(rating) : null,
        website,
        email,
        phone,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isActive: isActive === 'true' || isActive === true,
        order: order || 0,
        featured: featured === 'true' || featured === true,
        socialLinks: {
          linkedin,
          twitter,
          facebook
        }
      };
      
      // If new photo is uploaded, update photoUrl
      if (req.file) {
        updateData.photoUrl = `/uploads/happy-clients/${req.file.filename}`;
      }
      
      const client = await HappyClient.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!client) {
        return res.status(404).json({ message: 'Happy client not found' });
      }
      
      res.status(200).json(client);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

// Delete happy client
// DELETE /api/happy-clients/:id
exports.deleteHappyClient = async (req, res) => {
  try {
    const client = await HappyClient.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Happy client not found' });
    }
    
    // Delete the photo file from server
    if (client.photoUrl) {
      const photoPath = path.join(__dirname, '..', client.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    await HappyClient.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Happy client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle active status
// PATCH /api/happy-clients/:id/toggle-status
exports.toggleHappyClientStatus = async (req, res) => {
  try {
    const client = await HappyClient.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Happy client not found' });
    }
    
    client.isActive = !client.isActive;
    const updatedClient = await client.save();
    
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle featured status
// PATCH /api/happy-clients/:id/toggle-featured
exports.toggleHappyClientFeatured = async (req, res) => {
  try {
    const client = await HappyClient.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Happy client not found' });
    }
    
    client.featured = !client.featured;
    const updatedClient = await client.save();
    
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
