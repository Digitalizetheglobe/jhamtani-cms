const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const MediaPublicationModel = sequelize.define(
  'MediaPublication',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    publisher: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.STRING, allowNull: true },
    readTime: { type: DataTypes.STRING, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: true },
    articleUrl: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'media_publications', timestamps: true }
);

module.exports = wrapModel(MediaPublicationModel);
