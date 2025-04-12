const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const logger = require('../utils/logger');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'unauthorized',
          message: 'Authentication required',
          details: {}
        }
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        include: [Permission]
      }]
    });
    
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'unauthorized',
          message: 'User not found',
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
    
    // Add user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'invalid_token',
          message: 'Invalid token',
          details: {}
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'token_expired',
          message: 'Token expired',
          details: {}
        }
      });
    }
    
    logger.error('Authentication error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Authorization middleware
exports.authorize = (requiredRole) => {
  return (req, res, next) => {
    try {
      // User should be authenticated first
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'unauthorized',
            message: 'Authentication required',
            details: {}
          }
        });
      }
      
      // Check role
      if (requiredRole && req.user.role !== requiredRole && req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            code: 'forbidden',
            message: 'Insufficient permissions',
            details: {}
          }
        });
      }
      
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        error: {
          code: 'server_error',
          message: 'Internal server error',
          details: {}
        }
      });
    }
  };
};

// Permission-based authorization middleware
exports.hasPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      // User should be authenticated first
      if (!req.user) {
        return res.status(401).json({
          error: {
            code: 'unauthorized',
            message: 'Authentication required',
            details: {}
          }
        });
      }
      
      // Admin has all permissions
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Check permissions
      const permissions = req.user.Role?.Permissions || [];
      const hasPermission = permissions.some(p => 
        (p.resource === resource && (p.action === action || p.action === 'all')) ||
        (p.resource === '*' && p.action === '*')
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: {
            code: 'forbidden',
            message: 'Insufficient permissions',
            details: {}
          }
        });
      }
      
      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        error: {
          code: 'server_error',
          message: 'Internal server error',
          details: {}
        }
      });
    }
  };
};
