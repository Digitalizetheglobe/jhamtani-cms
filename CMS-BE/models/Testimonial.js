const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const TestimonialModel = sequelize.define(
  'Testimonial',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    testimonialText: { type: DataTypes.TEXT, allowNull: false },
    photo: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    companyName: { type: DataTypes.STRING, allowNull: true },
    otherFields: { type: DataTypes.JSONB, defaultValue: {} },
  },
  { tableName: 'testimonials', timestamps: true }
);

module.exports = wrapModel(TestimonialModel);
