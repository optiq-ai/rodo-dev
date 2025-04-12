const { Document, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Get all documents
exports.getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, createdBy, sort } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    if (category) where.category = category;
    if (createdBy) where.createdBy = createdBy;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Build sort options
    let order = [['createdAt', 'DESC']];
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortDirection = sort.startsWith('-') ? 'DESC' : 'ASC';
      order = [[sortField, sortDirection]];
    }
    
    // Query documents
    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['id', 'username']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order
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
    logger.error('Get documents error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id, {
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['id', 'username']
      }]
    });
    
    if (!document) {
      return res.status(404).json({
        error: {
          code: 'document_not_found',
          message: 'Document not found',
          details: {}
        }
      });
    }
    
    res.status(200).json(document);
  } catch (error) {
    logger.error('Get document by ID error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Create document
exports.createDocument = async (req, res) => {
  try {
    const { title, category, description, file, version } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Handle file upload if provided
    let fileUrl = null;
    if (file) {
      // Base64 decode and save file
      const fileBuffer = Buffer.from(file, 'base64');
      const fileName = `${Date.now()}_${title.replace(/\s+/g, '_')}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/documents', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(filePath, fileBuffer);
      fileUrl = `/uploads/documents/${fileName}`;
    }
    
    // Create document
    const document = await Document.create({
      title,
      category,
      description,
      fileUrl,
      version: version || '1.0',
      createdBy: userId,
      status: 'draft'
    });
    
    res.status(201).json(document);
  } catch (error) {
    logger.error('Create document error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, file, version, status } = req.body;
    
    // Find document
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        error: {
          code: 'document_not_found',
          message: 'Document not found',
          details: {}
        }
      });
    }
    
    // Handle file upload if provided
    let fileUrl = document.fileUrl;
    if (file) {
      // Base64 decode and save file
      const fileBuffer = Buffer.from(file, 'base64');
      const fileName = `${Date.now()}_${title || document.title.replace(/\s+/g, '_')}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/documents', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(filePath, fileBuffer);
      fileUrl = `/uploads/documents/${fileName}`;
    }
    
    // Update document fields
    if (title) document.title = title;
    if (category) document.category = category;
    if (description) document.description = description;
    if (fileUrl) document.fileUrl = fileUrl;
    if (version) document.version = version;
    if (status) document.status = status;
    
    // Save document
    await document.save();
    
    res.status(200).json(document);
  } catch (error) {
    logger.error('Update document error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find document
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        error: {
          code: 'document_not_found',
          message: 'Document not found',
          details: {}
        }
      });
    }
    
    // Delete document (soft delete)
    await document.destroy();
    
    res.status(200).json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Get document versions
exports.getDocumentVersions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find document
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        error: {
          code: 'document_not_found',
          message: 'Document not found',
          details: {}
        }
      });
    }
    
    // Get versions
    const versions = await Document.findAll({
      where: {
        [Op.or]: [
          { id },
          { parentId: id }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['id', 'username']
      }]
    });
    
    res.status(200).json(versions);
  } catch (error) {
    logger.error('Get document versions error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};
