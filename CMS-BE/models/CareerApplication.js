const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const CareerApplicationModel = sequelize.define(
  'CareerApplication',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    positionApplyingFor: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    experienceYears: { type: DataTypes.STRING, allowNull: false },
    linkedinUrl: { type: DataTypes.STRING, allowNull: true },
    resumeUrl: { type: DataTypes.STRING, allowNull: true },
    briefNote: { type: DataTypes.TEXT, allowNull: true },
    consent: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.STRING, defaultValue: 'new' }, // new | reviewed | shortlisted | rejected
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: 'career_applications', timestamps: true }
);

module.exports = wrapModel(CareerApplicationModel);
