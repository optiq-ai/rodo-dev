const { User, Role, Permission } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search, fields } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Build attributes to return
    let attributes = { exclude: ['password'] };
    if (fields) {
      const fieldList = fields.split(',');
      attributes = fieldList.includes('password') 
        ? fieldList.filter(f => f !== 'password') 
        : fieldList;
    }
    
    // Query users
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes,
      include: [{
        model: Role,
        attributes: ['id', 'name']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
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
    logger.error('Get users error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        include: [Permission]
      }]
    });
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'user_not_found',
          message: 'User not found',
          details: {}
        }
      });
    }
    
    // Get permissions
    const permissions = user.Role?.Permissions?.map(p => `${p.resource}:${p.action}`) || [];
    
    // Format response
    const userData = {
      ...user.toJSON(),
      permissions
    };
    delete userData.password;
    
    res.status(200).json(userData);
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role, department, status } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'user_already_exists',
          message: 'Username or email already exists',
          details: {}
        }
      });
    }
    
    // Find default role if not specified
    let roleId = null;
    if (role) {
      const foundRole = await Role.findOne({ where: { name: role } });
      if (foundRole) roleId = foundRole.id;
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'employee',
      department,
      status: status || 'active',
      RoleId: roleId
    });
    
    // Return user without password
    const userData = user.toJSON();
    delete userData.password;
    
    res.status(201).json(userData);
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, department, status, password } = req.body;
    
    // Find user
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'user_not_found',
          message: 'User not found',
          details: {}
        }
      });
    }
    
    // Update user fields
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (status) user.status = status;
    if (password) user.password = password; // Will be hashed by model hook
    
    // Find role if specified
    if (role) {
      const foundRole = await Role.findOne({ where: { name: role } });
      if (foundRole) user.RoleId = foundRole.id;
    }
    
    // Save user
    await user.save();
    
    // Return updated user without password
    const userData = user.toJSON();
    delete userData.password;
    
    res.status(200).json(userData);
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'user_not_found',
          message: 'User not found',
          details: {}
        }
      });
    }
    
    // Delete user (soft delete)
    await user.destroy();
    
    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};
