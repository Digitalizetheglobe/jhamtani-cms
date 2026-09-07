const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const GALLERY_CATEGORIES = ['exhibitions', 'happy clients', 'outings', 'festivals'];

const GalleryPhotoModel = sequelize.define(
  'GalleryPhoto',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    altText: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },
    tags: { type: DataTypes.JSONB, defaultValue: [] },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    uploadedBy: { type: DataTypes.STRING, allowNull: true },
    fileSize: { type: DataTypes.INTEGER, allowNull: true },
    dimensions: { type: DataTypes.JSONB, defaultValue: {} },
  },
  { tableName: 'gallery_photos', timestamps: true }
);

module.exports = wrapModel(GalleryPhotoModel, {
  statics: {
    getAllowedCategories: () => GALLERY_CATEGORIES,
  },
});
