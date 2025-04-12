const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  action: {
    type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'all'),
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true // Soft delete
});

module.exports = Permission;
