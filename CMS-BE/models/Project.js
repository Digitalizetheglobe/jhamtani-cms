const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const ProjectModel = sequelize.define(
  'Project',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: '' },
    plotSize: { type: DataTypes.STRING, defaultValue: '' },
    naStatus: { type: DataTypes.STRING, defaultValue: '' },
    pageLink: { type: DataTypes.STRING, defaultValue: '' },
    category: { type: DataTypes.STRING, defaultValue: 'residential' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdBy: { type: DataTypes.UUID, allowNull: true },
    updatedBy: { type: DataTypes.UUID, allowNull: true },
  },
  { tableName: 'projects', timestamps: true }
);

module.exports = wrapModel(ProjectModel);
