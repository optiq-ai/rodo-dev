const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('access', 'rectification', 'erasure', 'restriction', 'portability', 'objection'),
    allowNull: false
  },
  typeName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'completed', 'rejected'),
    allowNull: false,
    defaultValue: 'new'
  },
  submissionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  deadlineDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dataSubject: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  contactInfo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true, // Soft delete
  hooks: {
    beforeCreate: (request) => {
      // Set deadline date based on request type (default 30 days)
      const deadlineDays = 30;
      const submissionDate = request.submissionDate || new Date();
      const deadlineDate = new Date(submissionDate);
      deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);
      request.deadlineDate = deadlineDate;
      
      // Set typeName based on type
      const typeNames = {
        'access': 'Dostęp do danych',
        'rectification': 'Sprostowanie danych',
        'erasure': 'Usunięcie danych',
        'restriction': 'Ograniczenie przetwarzania',
        'portability': 'Przenoszenie danych',
        'objection': 'Sprzeciw wobec przetwarzania'
      };
      request.typeName = typeNames[request.type] || request.type;
    }
  }
});

module.exports = Request;
