const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RiskAsset = sequelize.define('RiskAsset', {
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
  dataCategories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  riskAnalysisId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true // Soft delete
});

module.exports = RiskAsset;
