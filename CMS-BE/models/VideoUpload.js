const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const VideoUploadModel = sequelize.define(
  'VideoUpload',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sourceType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'local' }, // youtube | local
    youtubeUrl: { type: DataTypes.STRING, allowNull: true },
    projectName: { type: DataTypes.STRING, allowNull: true },
    tagline: { type: DataTypes.STRING, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    videoUrl: { type: DataTypes.STRING, allowNull: true },
    thumbnailUrl: { type: DataTypes.STRING, allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: true },
    fileSize: { type: DataTypes.INTEGER, allowNull: true },
    format: { type: DataTypes.STRING, allowNull: true },
    resolution: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },
    tags: { type: DataTypes.JSONB, defaultValue: [] },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    uploadedBy: { type: DataTypes.STRING, allowNull: true },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: 'video_uploads', timestamps: true }
);

module.exports = wrapModel(VideoUploadModel);
