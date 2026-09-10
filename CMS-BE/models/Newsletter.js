const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const NewsletterModel = sequelize.define(
  'Newsletter',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    month: { type: DataTypes.STRING, allowNull: true },
    year: { type: DataTypes.INTEGER, allowNull: true },
    badge: { type: DataTypes.STRING, allowNull: true },
    tagline: { type: DataTypes.TEXT, allowNull: true },
    pdfDocument: { type: DataTypes.STRING, allowNull: true },
    coverImage: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'newsletters', timestamps: true }
);

module.exports = wrapModel(NewsletterModel);
