const { RiskAnalysis, RiskAsset, RiskThreat, SecurityMeasure, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Get all risk analyses
exports.getRiskAnalyses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }
    
    // Query risk analyses
    const { count, rows } = await RiskAnalysis.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['id', 'username']
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
    logger.error('Get risk analyses error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Get risk analysis by ID
exports.getRiskAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const riskAnalysis = await RiskAnalysis.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username']
        },
        {
          model: RiskAsset
        },
        {
          model: RiskThreat
        },
        {
          model: SecurityMeasure
        }
      ]
    });
    
    if (!riskAnalysis) {
      return res.status(404).json({
        error: {
          code: 'risk_analysis_not_found',
          message: 'Risk analysis not found',
          details: {}
        }
      });
    }
    
    res.status(200).json(riskAnalysis);
  } catch (error) {
    logger.error('Get risk analysis by ID error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Create risk analysis
exports.createRiskAnalysis = async (req, res) => {
  try {
    const { name, description, assets, threats, securityMeasures } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Create risk analysis
    const riskAnalysis = await RiskAnalysis.create({
      name,
      description,
      status: 'draft',
      createdBy: userId
    });
    
    // Create assets if provided
    if (assets && Array.isArray(assets)) {
      for (const asset of assets) {
        await RiskAsset.create({
          name: asset.name,
          description: asset.description,
          dataCategories: asset.dataCategories || [],
          riskAnalysisId: riskAnalysis.id
        });
      }
    }
    
    // Create threats if provided
    if (threats && Array.isArray(threats)) {
      for (const threat of threats) {
        await RiskThreat.create({
          name: threat.name,
          description: threat.description,
          probability: threat.probability || 'medium',
          impact: threat.impact || 'medium',
          riskAnalysisId: riskAnalysis.id
        });
      }
    }
    
    // Create security measures if provided
    if (securityMeasures && Array.isArray(securityMeasures)) {
      for (const measure of securityMeasures) {
        await SecurityMeasure.create({
          name: measure.name,
          description: measure.description,
          status: measure.status || 'planned',
          riskAnalysisId: riskAnalysis.id
        });
      }
    }
    
    // Calculate risk level based on threats
    const allThreats = await RiskThreat.findAll({
      where: { riskAnalysisId: riskAnalysis.id }
    });
    
    if (allThreats.length > 0) {
      // Simple algorithm: highest impact and probability determines risk level
      const impactLevels = { 'low': 1, 'medium': 2, 'high': 3 };
      const probabilityLevels = { 'low': 1, 'medium': 2, 'high': 3 };
      
      let maxRisk = 0;
      for (const threat of allThreats) {
        const riskScore = impactLevels[threat.impact] * probabilityLevels[threat.probability];
        maxRisk = Math.max(maxRisk, riskScore);
      }
      
      let riskLevel = 'low';
      if (maxRisk >= 6) riskLevel = 'high';
      else if (maxRisk >= 3) riskLevel = 'medium';
      
      riskAnalysis.riskLevel = riskLevel;
      await riskAnalysis.save();
    }
    
    // Return complete risk analysis with related entities
    const completeRiskAnalysis = await RiskAnalysis.findByPk(riskAnalysis.id, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username']
        },
        {
          model: RiskAsset
        },
        {
          model: RiskThreat
        },
        {
          model: SecurityMeasure
        }
      ]
    });
    
    res.status(201).json(completeRiskAnalysis);
  } catch (error) {
    logger.error('Create risk analysis error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Update risk analysis
exports.updateRiskAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, assets, threats, securityMeasures } = req.body;
    
    // Find risk analysis
    const riskAnalysis = await RiskAnalysis.findByPk(id);
    
    if (!riskAnalysis) {
      return res.status(404).json({
        error: {
          code: 'risk_analysis_not_found',
          message: 'Risk analysis not found',
          details: {}
        }
      });
    }
    
    // Update risk analysis fields
    if (name) riskAnalysis.name = name;
    if (description) riskAnalysis.description = description;
    if (status) {
      riskAnalysis.status = status;
      if (status === 'completed') {
        riskAnalysis.completedDate = new Date();
      }
    }
    
    // Save risk analysis
    await riskAnalysis.save();
    
    // Update assets if provided
    if (assets && Array.isArray(assets)) {
      // Delete existing assets
      await RiskAsset.destroy({ where: { riskAnalysisId: id } });
      
      // Create new assets
      for (const asset of assets) {
        await RiskAsset.create({
          name: asset.name,
          description: asset.description,
          dataCategories: asset.dataCategories || [],
          riskAnalysisId: id
        });
      }
    }
    
    // Update threats if provided
    if (threats && Array.isArray(threats)) {
      // Delete existing threats
      await RiskThreat.destroy({ where: { riskAnalysisId: id } });
      
      // Create new threats
      for (const threat of threats) {
        await RiskThreat.create({
          name: threat.name,
          description: threat.description,
          probability: threat.probability || 'medium',
          impact: threat.impact || 'medium',
          riskAnalysisId: id
        });
      }
    }
    
    // Update security measures if provided
    if (securityMeasures && Array.isArray(securityMeasures)) {
      // Delete existing security measures
      await SecurityMeasure.destroy({ where: { riskAnalysisId: id } });
      
      // Create new security measures
      for (const measure of securityMeasures) {
        await SecurityMeasure.create({
          name: measure.name,
          description: measure.description,
          status: measure.status || 'planned',
          riskAnalysisId: id
        });
      }
    }
    
    // Recalculate risk level based on threats
    const allThreats = await RiskThreat.findAll({
      where: { riskAnalysisId: id }
    });
    
    if (allThreats.length > 0) {
      // Simple algorithm: highest impact and probability determines risk level
      const impactLevels = { 'low': 1, 'medium': 2, 'high': 3 };
      const probabilityLevels = { 'low': 1, 'medium': 2, 'high': 3 };
      
      let maxRisk = 0;
      for (const threat of allThreats) {
        const riskScore = impactLevels[threat.impact] * probabilityLevels[threat.probability];
        maxRisk = Math.max(maxRisk, riskScore);
      }
      
      let riskLevel = 'low';
      if (maxRisk >= 6) riskLevel = 'high';
      else if (maxRisk >= 3) riskLevel = 'medium';
      
      riskAnalysis.riskLevel = riskLevel;
      await riskAnalysis.save();
    }
    
    // Return complete risk analysis with related entities
    const completeRiskAnalysis = await RiskAnalysis.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'username']
        },
        {
          model: RiskAsset
        },
        {
          model: RiskThreat
        },
        {
          model: SecurityMeasure
        }
      ]
    });
    
    res.status(200).json(completeRiskAnalysis);
  } catch (error) {
    logger.error('Update risk analysis error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};

// Delete risk analysis
exports.deleteRiskAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find risk analysis
    const riskAnalysis = await RiskAnalysis.findByPk(id);
    
    if (!riskAnalysis) {
      return res.status(404).json({
        error: {
          code: 'risk_analysis_not_found',
          message: 'Risk analysis not found',
          details: {}
        }
      });
    }
    
    // Delete related entities
    await RiskAsset.destroy({ where: { riskAnalysisId: id } });
    await RiskThreat.destroy({ where: { riskAnalysisId: id } });
    await SecurityMeasure.destroy({ where: { riskAnalysisId: id } });
    
    // Delete risk analysis (soft delete)
    await riskAnalysis.destroy();
    
    res.status(200).json({
      message: 'Risk analysis deleted successfully'
    });
  } catch (error) {
    logger.error('Delete risk analysis error:', error);
    res.status(500).json({
      error: {
        code: 'server_error',
        message: 'Internal server error',
        details: {}
      }
    });
  }
};
