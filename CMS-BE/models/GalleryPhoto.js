const mongoose = require('mongoose');

const GALLERY_CATEGORIES = [
  'exhibitions',
  'happy clients',
  'outings',
  'festivals'
];

const galleryPhotoSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  altText: { type: String },
  category: { type: String, enum: GALLERY_CATEGORIES },
  tags: [String],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  uploadedBy: { type: String },
  fileSize: { type: Number },
  dimensions: {
    width: { type: Number },
    height: { type: Number }
  }
}, {
  timestamps: true
});

galleryPhotoSchema.statics.getAllowedCategories = function() {
  return GALLERY_CATEGORIES;
};

module.exports = mongoose.model('GalleryPhoto', galleryPhotoSchema);
