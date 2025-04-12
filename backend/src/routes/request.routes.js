const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { authenticate, hasPermission } = require('../middleware/auth.middleware');

// Get all requests route
router.get('/', authenticate, hasPermission('requests', 'read'), requestController.getRequests);

// Get request by ID route
router.get('/:id', authenticate, hasPermission('requests', 'read'), requestController.getRequestById);

// Create request route
router.post('/', authenticate, hasPermission('requests', 'create'), requestController.createRequest);

// Update request route
router.put('/:id', authenticate, hasPermission('requests', 'update'), requestController.updateRequest);

// Delete request route
router.delete('/:id', authenticate, hasPermission('requests', 'delete'), requestController.deleteRequest);

module.exports = router;
