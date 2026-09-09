const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const BrochureModel = sequelize.define(
  'Brochure',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectName: { type: DataTypes.STRING, allowNull: false },
    projectLogo: { type: DataTypes.STRING, allowNull: true },
    projectTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Residential',
    }, // Residential | Commercial | Studio
    location: { type: DataTypes.STRING, allowNull: true },
    tagline: { type: DataTypes.STRING, allowNull: true },
    projectPageUrl: { type: DataTypes.STRING, allowNull: true },
    brochureDocument: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'brochures', timestamps: true }
);

module.exports = wrapModel(BrochureModel);
