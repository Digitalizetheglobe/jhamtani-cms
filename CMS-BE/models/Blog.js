const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const BlogModel = sequelize.define(
  'Blog',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    uploadImage: { type: DataTypes.STRING, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: false },
    coverImage: { type: DataTypes.STRING, allowNull: true },
    author: { type: DataTypes.STRING, allowNull: true },
    tags: { type: DataTypes.JSONB, defaultValue: [] },
    categories: { type: DataTypes.JSONB, defaultValue: [] },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
    metaTitle: { type: DataTypes.STRING, allowNull: true },
    metaDescription: { type: DataTypes.TEXT, allowNull: true },
    ogTitle: { type: DataTypes.STRING, allowNull: true },
    ogDescription: { type: DataTypes.TEXT, allowNull: true },
    ogImage: { type: DataTypes.STRING, allowNull: true },
    readTime: { type: DataTypes.INTEGER, allowNull: true },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    likes: { type: DataTypes.INTEGER, defaultValue: 0 },
    commentsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'blogs', timestamps: true }
);

module.exports = wrapModel(BlogModel);
