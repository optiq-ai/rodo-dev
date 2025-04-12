const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SecurityMeasure = sequelize.define('SecurityMeasure', {
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
    type: DataTypes.ENUM('planned', 'in_progress', 'implemented'),
    allowNull: false,
    defaultValue: 'planned'
  },
  riskAnalysisId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  implementationDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true // Soft delete
});

module.exports = SecurityMeasure;
