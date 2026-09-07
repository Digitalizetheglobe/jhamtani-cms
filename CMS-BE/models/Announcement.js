const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const AnnouncementModel = sequelize.define(
  'Announcement',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    departments: { type: DataTypes.JSONB, defaultValue: [] },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
    showOnFrontend: { type: DataTypes.BOOLEAN, defaultValue: true },
    announcementImage: { type: DataTypes.STRING, defaultValue: '' },
  },
  { tableName: 'announcements', timestamps: true }
);

module.exports = wrapModel(AnnouncementModel);
