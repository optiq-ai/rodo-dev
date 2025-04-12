const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize, hasPermission } = require('../middleware/auth.middleware');

// Get all users route
router.get('/', authenticate, hasPermission('users', 'read'), userController.getUsers);

// Get user by ID route
router.get('/:id', authenticate, hasPermission('users', 'read'), userController.getUserById);

// Create user route
router.post('/', authenticate, hasPermission('users', 'create'), userController.createUser);

// Update user route
router.put('/:id', authenticate, hasPermission('users', 'update'), userController.updateUser);

// Delete user route
router.delete('/:id', authenticate, hasPermission('users', 'delete'), userController.deleteUser);

module.exports = router;
