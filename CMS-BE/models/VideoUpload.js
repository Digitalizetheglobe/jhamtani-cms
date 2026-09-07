const mongoose = require('mongoose');

const videoUploadSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  videoUrl: { type: String },
  thumbnailUrl: { type: String },
  duration: { type: Number }, // in seconds
  fileSize: { type: Number }, // in bytes
  format: { type: String },
  resolution: { type: String },
  category: { type: String },
  tags: [String],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  uploadedBy: { type: String },
  views: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('VideoUpload', videoUploadSchema);
