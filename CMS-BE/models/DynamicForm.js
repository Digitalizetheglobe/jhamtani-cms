const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { wrapModel } = require('./mongooseCompat');

const DynamicFormModel = sequelize.define(
  'DynamicForm',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    page: { type: DataTypes.STRING, allowNull: false },
    fields: { type: DataTypes.JSONB, defaultValue: [] },
    emailSettings: { type: DataTypes.JSONB, defaultValue: {} },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdBy: { type: DataTypes.UUID, allowNull: true },
    updatedBy: { type: DataTypes.UUID, allowNull: true },
  },
  { tableName: 'dynamic_forms', timestamps: true }
);

const FormSubmissionModel = sequelize.define(
  'FormSubmission',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    formId: { type: DataTypes.UUID, allowNull: false },
    data: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    submittedBy: { type: DataTypes.UUID, allowNull: true },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
    userAgent: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: 'form_submissions', timestamps: true }
);

module.exports = {
  DynamicForm: wrapModel(DynamicFormModel),
  FormSubmission: wrapModel(FormSubmissionModel),
};
