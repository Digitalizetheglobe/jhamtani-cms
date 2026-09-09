const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const ProjectLocationModel = sequelize.define(
  'ProjectLocation',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectName: { type: DataTypes.STRING, allowNull: false },
    projectType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Residential',
    }, // Residential | Commercial | Studio
    location: { type: DataTypes.STRING, allowNull: true },
    tagline: { type: DataTypes.STRING, allowNull: true },
    locationUrl: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'project_locations', timestamps: true }
);

module.exports = wrapModel(ProjectLocationModel);
