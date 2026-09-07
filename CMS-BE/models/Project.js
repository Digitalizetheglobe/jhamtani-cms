const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Project image is required'],
    },
    status: {
      type: String,
      trim: true,
      default: '',
    },
    plotSize: {
      type: String,
      trim: true,
      default: '',
    },
    naStatus: {
      type: String,
      trim: true,
      default: '',
    },
    pageLink: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['na-plots', 'residential', 'commercial'],
      default: 'na-plots',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
