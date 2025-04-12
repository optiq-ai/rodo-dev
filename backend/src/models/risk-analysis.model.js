const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RiskAnalysis = sequelize.define('RiskAnalysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'completed', 'archived'),
    allowNull: false,
    defaultValue: 'draft'
  },
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  completedDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true // Soft delete
});

module.exports = RiskAnalysis;
