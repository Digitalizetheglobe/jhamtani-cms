const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const AdminModel = sequelize.define(
  'Admin',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: 'admins', timestamps: true }
);

const hashPassword = async (admin) => {
  if (admin.changed('password')) {
    admin.password = await bcrypt.hash(admin.password, 10);
  }
};

AdminModel.beforeCreate(hashPassword);
AdminModel.beforeUpdate(hashPassword);

module.exports = wrapModel(AdminModel, { hidePassword: true });
