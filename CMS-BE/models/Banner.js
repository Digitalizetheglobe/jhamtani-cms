const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const BannerModel = sequelize.define(
  'Banner',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    placement: { type: DataTypes.STRING, defaultValue: '' },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    mediaType: { type: DataTypes.STRING, defaultValue: 'image' },
    desktopBanner: { type: DataTypes.STRING, allowNull: false },
    tabletBanner: { type: DataTypes.STRING, defaultValue: '' },
    mobileBanner: { type: DataTypes.STRING, defaultValue: '' },
    linkUrl: { type: DataTypes.STRING, defaultValue: '' },
    target: { type: DataTypes.STRING, defaultValue: '_self' },
    altText: { type: DataTypes.STRING, defaultValue: '' },
    caption: { type: DataTypes.STRING, defaultValue: '' },
    subCaption: { type: DataTypes.STRING, defaultValue: '' },
    buttonText: { type: DataTypes.STRING, defaultValue: '' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    startDate: { type: DataTypes.DATE, allowNull: true },
    endDate: { type: DataTypes.DATE, allowNull: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdBy: { type: DataTypes.UUID, allowNull: true },
    updatedBy: { type: DataTypes.UUID, allowNull: true },
  },
  { tableName: 'banners', timestamps: true }
);

module.exports = wrapModel(BannerModel);
