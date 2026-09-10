const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const SiteUpdateModel = sequelize.define(
  'SiteUpdate',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectName: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    month: { type: DataTypes.STRING, allowNull: true },
    projectCategory: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Residential',
    }, // Residential | Commercial | Studio
    location: { type: DataTypes.STRING, allowNull: true },
    tagline: { type: DataTypes.TEXT, allowNull: true },
    projectLink: { type: DataTypes.STRING, allowNull: true },
    images: { type: DataTypes.JSONB, defaultValue: [] },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'site_updates', timestamps: true }
);

module.exports = wrapModel(SiteUpdateModel);
