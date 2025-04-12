const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { authenticate, hasPermission } = require('../middleware/auth.middleware');

// Get all documents route
router.get('/', authenticate, hasPermission('documents', 'read'), documentController.getDocuments);

// Get document by ID route
router.get('/:id', authenticate, hasPermission('documents', 'read'), documentController.getDocumentById);

// Create document route
router.post('/', authenticate, hasPermission('documents', 'create'), documentController.createDocument);

// Update document route
router.put('/:id', authenticate, hasPermission('documents', 'update'), documentController.updateDocument);

// Delete document route
router.delete('/:id', authenticate, hasPermission('documents', 'delete'), documentController.deleteDocument);

// Get document versions route
router.get('/:id/versions', authenticate, hasPermission('documents', 'read'), documentController.getDocumentVersions);

module.exports = router;
