const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const MahareraModel = sequelize.define(
  'Maharera',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectName: { type: DataTypes.STRING, allowNull: false },
    projectType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Residential',
    }, // Residential | Commercial | Studio
    projectLocation: { type: DataTypes.STRING, allowNull: true },
    tagline: { type: DataTypes.STRING, allowNull: true },
    mahareraNo: { type: DataTypes.STRING, allowNull: true },
    projectImage: { type: DataTypes.STRING, allowNull: true },
    mahareraDocument: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'mahareras', timestamps: true }
);

module.exports = wrapModel(MahareraModel);
