const express = require('express');
const router = express.Router();
const riskAnalysisController = require('../controllers/risk-analysis.controller');
const { authenticate, hasPermission } = require('../middleware/auth.middleware');

// Get all risk analyses route
router.get('/', authenticate, hasPermission('risk-analysis', 'read'), riskAnalysisController.getRiskAnalyses);

// Get risk analysis by ID route
router.get('/:id', authenticate, hasPermission('risk-analysis', 'read'), riskAnalysisController.getRiskAnalysisById);

// Create risk analysis route
router.post('/', authenticate, hasPermission('risk-analysis', 'create'), riskAnalysisController.createRiskAnalysis);

// Update risk analysis route
router.put('/:id', authenticate, hasPermission('risk-analysis', 'update'), riskAnalysisController.updateRiskAnalysis);

// Delete risk analysis route
router.delete('/:id', authenticate, hasPermission('risk-analysis', 'delete'), riskAnalysisController.deleteRiskAnalysis);

module.exports = router;
