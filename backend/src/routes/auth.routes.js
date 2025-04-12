const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Login route
router.post('/login', authController.login);

// Refresh token route
router.post('/refresh', authenticate, authController.refreshToken);

// Logout route
router.post('/logout', authenticate, authController.logout);

// Get current user route
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
