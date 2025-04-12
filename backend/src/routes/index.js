const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const documentRoutes = require('./document.routes');
const incidentRoutes = require('./incident.routes');
const requestRoutes = require('./request.routes');
const riskAnalysisRoutes = require('./risk-analysis.routes');

// Define API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/incidents', incidentRoutes);
router.use('/requests', requestRoutes);
router.use('/risk-analysis', riskAnalysisRoutes);

// API health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'RODO API is running' });
});

module.exports = router;
