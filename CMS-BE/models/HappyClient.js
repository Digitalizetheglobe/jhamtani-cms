const mongoose = require('mongoose');

const happyClientSchema = new mongoose.Schema({
  name: { type: String },
  company: { type: String },
  position: { type: String },
  photoUrl: { type: String },
  postRedirect: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  website: { type: String },
  email: { type: String },
  phone: { type: String },
  category: { type: String },
  tags: [String],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  socialLinks: {
    linkedin: { type: String },
    twitter: { type: String },
    facebook: { type: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HappyClient', happyClientSchema);
