const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    placement: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    desktopBanner: {
      type: String,
      required: [true, 'Desktop banner is required'],
    },
    tabletBanner: {
      type: String,
      default: '',
    },
    mobileBanner: {
      type: String,
      default: '',
    },
    linkUrl: {
      type: String,
      trim: true,
      default: '',
    },
    target: {
      type: String,
      enum: ['_self', '_blank'],
      default: '_self',
    },
    altText: {
      type: String,
      trim: true,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    subCaption: {
      type: String,
      trim: true,
      default: '',
    },
    buttonText: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
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

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
