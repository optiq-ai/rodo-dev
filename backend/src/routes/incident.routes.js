const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incident.controller');
const { authenticate, hasPermission } = require('../middleware/auth.middleware');

// Get all incidents route
router.get('/', authenticate, hasPermission('incidents', 'read'), incidentController.getIncidents);

// Get incident by ID route
router.get('/:id', authenticate, hasPermission('incidents', 'read'), incidentController.getIncidentById);

// Create incident route
router.post('/', authenticate, hasPermission('incidents', 'create'), incidentController.createIncident);

// Update incident route
router.put('/:id', authenticate, hasPermission('incidents', 'update'), incidentController.updateIncident);

// Delete incident route
router.delete('/:id', authenticate, hasPermission('incidents', 'delete'), incidentController.deleteIncident);

module.exports = router;
