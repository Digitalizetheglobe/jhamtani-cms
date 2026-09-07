const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  photo: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  linkedinUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        // More comprehensive LinkedIn URL validation
        // Supports various LinkedIn URL formats including international domains
        const linkedinPattern = /^https?:\/\/([a-z]+\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9\-_\.%]+\/?$/;
        return linkedinPattern.test(v);
      },
      message: 'Please provide a valid LinkedIn URL (e.g., https://linkedin.com/in/username or https://www.linkedin.com/in/username)'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
