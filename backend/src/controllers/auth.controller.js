const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Role, Permission } = require('../models');
const logger = require('../utils/logger');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRATION || '1h' 
    }
  );
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate request
    if (!username || !password) {
      return res.status(400).json({
        error: {
          code: 'missing_fields',
          message: 'Username and password are required',
          details: {}
        }
      });
    }

    // Find user by username
    const user = await User.findOne({ 
      where: { username },
      include: [{
        model: Role,
        include: [Permission]
      }]
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'invalid_credentials',
          message: 'Invalid username or password',
          details: {}
        }
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        error: {
          code: 'account_inactive',
          message: 'Account is inactive or locked',
          details: { status: user.status }
        }
      });
    }

    // Validate password
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'invalid_credentials',
          message: 'Invalid username or password',
          details: {}
        }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Get permissions
    const permissions = user.Role?.Permissions?.map(p => `${p.resource}:${p.action}`) || [];

    // Return user and token
    res.status(200).json({
      token,
      expiresIn: parseInt(process.env.JWT_EXPIRATION) || 3600,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Refresh token controller
exports.refreshToken = async (req, res) => {
  try {
    // User is already authenticated via middleware
    const user = req.user;
    
    // Generate new token
    const token = generateToken(user);
    
    res.status(200).json({
      token,
      expiresIn: parseInt(process.env.JWT_EXPIRATION) || 3600
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Logout controller
exports.logout = async (req, res) => {
  // JWT is stateless, so we can't invalidate it on the server
  // Client should remove the token from storage
  res.status(200).json({
    message: 'Logout successful'
  });
};

// Get current user controller
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already authenticated via middleware
    const userId = req.user.id;
    
    // Find user with role and permissions
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        include: [Permission]
      }],
      attributes: { exclude: ['password'] }
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
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      lastLogin: user.lastLogin,
      permissions
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};
