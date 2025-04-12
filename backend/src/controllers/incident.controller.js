const { Incident, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Get all incidents
exports.getIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, severity, search, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date[Op.gte] = new Date(dateFrom);
      if (dateTo) where.date[Op.lte] = new Date(dateTo);
    }
    
    // Query incidents
    const { count, rows } = await Incident.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'Reporter',
        attributes: ['id', 'username']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });
    
    // Calculate pagination
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: totalPages
      }
    });
  } catch (error) {
    logger.error('Get incidents error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Get incident by ID
exports.getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const incident = await Incident.findByPk(id, {
      include: [{
        model: User,
        as: 'Reporter',
        attributes: ['id', 'username']
      }]
    });
    
    if (!incident) {
      return res.status(404).json({
        error: {
          code: 'incident_not_found',
          message: 'Incident not found',
          details: {}
        }
      });
    }
    
    res.status(200).json(incident);
  } catch (error) {
    logger.error('Get incident by ID error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Create incident
exports.createIncident = async (req, res) => {
  try {
    const { title, description, severity, affectedData, actions, notificationRequired } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Create incident
    const incident = await Incident.create({
      title,
      description,
      date: new Date(),
      status: 'new',
      severity: severity || 'medium',
      reportedBy: userId,
      affectedData,
      actions,
      notificationRequired: notificationRequired || false
    });
    
    // If notification is required, we would handle that here
    // This could involve sending emails, SMS, etc.
    
    res.status(201).json(incident);
  } catch (error) {
    logger.error('Create incident error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Update incident
exports.updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, severity, affectedData, actions, notificationRequired } = req.body;
    
    // Find incident
    const incident = await Incident.findByPk(id);
    
    if (!incident) {
      return res.status(404).json({
        error: {
          code: 'incident_not_found',
          message: 'Incident not found',
          details: {}
        }
      });
    }
    
    // Update incident fields
    if (title) incident.title = title;
    if (description) incident.description = description;
    if (status) incident.status = status;
    if (severity) incident.severity = severity;
    if (affectedData) incident.affectedData = affectedData;
    if (actions) incident.actions = actions;
    if (notificationRequired !== undefined) incident.notificationRequired = notificationRequired;
    
    // If notification is required and not sent yet, we would handle that here
    if (incident.notificationRequired && !incident.notificationSent) {
      // Send notification logic would go here
      incident.notificationSent = true;
      incident.notificationDate = new Date();
    }
    
    // Save incident
    await incident.save();
    
    res.status(200).json(incident);
  } catch (error) {
    logger.error('Update incident error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Delete incident
exports.deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find incident
    const incident = await Incident.findByPk(id);
    
    if (!incident) {
      return res.status(404).json({
        error: {
          code: 'incident_not_found',
          message: 'Incident not found',
          details: {}
        }
      });
    }
    
    // Delete incident (soft delete)
    await incident.destroy();
    
    res.status(200).json({
      message: 'Incident deleted successfully'
    });
  } catch (error) {
    logger.error('Delete incident error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};
