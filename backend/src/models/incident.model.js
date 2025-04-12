const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'closed'),
    allowNull: false,
    defaultValue: 'new'
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  reportedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  affectedData: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notificationRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notificationDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true // Soft delete
});

module.exports = Incident;
