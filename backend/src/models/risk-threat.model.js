const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RiskThreat = sequelize.define('RiskThreat', {
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
  probability: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium'
  },
  impact: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium'
  },
  riskAnalysisId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true // Soft delete
});

module.exports = RiskThreat;
