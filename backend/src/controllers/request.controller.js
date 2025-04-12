const { Request, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Get all requests
exports.getRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { dataSubject: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      where.submissionDate = {};
      if (dateFrom) where.submissionDate[Op.gte] = new Date(dateFrom);
      if (dateTo) where.submissionDate[Op.lte] = new Date(dateTo);
    }
    
    // Query requests
    const { count, rows } = await Request.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'Assignee',
        attributes: ['id', 'username']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['submissionDate', 'DESC']]
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
    logger.error('Get requests error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Get request by ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findByPk(id, {
      include: [{
        model: User,
        as: 'Assignee',
        attributes: ['id', 'username']
      }]
    });
    
    if (!request) {
      return res.status(404).json({
        error: {
          code: 'request_not_found',
          message: 'Request not found',
          details: {}
        }
      });
    }
    
    res.status(200).json(request);
  } catch (error) {
    logger.error('Get request by ID error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Create request
exports.createRequest = async (req, res) => {
  try {
    const { type, dataSubject, contactInfo, description } = req.body;
    
    // Create request
    const request = await Request.create({
      type,
      dataSubject,
      contactInfo,
      description,
      status: 'new',
      submissionDate: new Date()
    });
    
    res.status(201).json(request);
  } catch (error) {
    logger.error('Create request error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Update request
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;
    
    // Find request
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({
        error: {
          code: 'request_not_found',
          message: 'Request not found',
          details: {}
        }
      });
    }
    
    // Update request fields
    if (status) request.status = status;
    if (assignedTo) request.assignedTo = assignedTo;
    if (notes) request.notes = notes;
    
    // Save request
    await request.save();
    
    res.status(200).json(request);
  } catch (error) {
    logger.error('Update request error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Delete request
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find request
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({
        error: {
          code: 'request_not_found',
          message: 'Request not found',
          details: {}
        }
      });
    }
    
    // Delete request (soft delete)
    await request.destroy();
    
    res.status(200).json({
      message: 'Request deleted successfully'
    });
  } catch (error) {
    logger.error('Delete request error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};
