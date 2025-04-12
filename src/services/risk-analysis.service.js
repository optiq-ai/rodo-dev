import api from './api';

// Risk Analysis service
const RiskAnalysisService = {
  // Get all risk analyses with pagination and filters
  getRiskAnalyses: async (params = {}) => {
    try {
      const response = await api.get('/risk-analysis', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch risk analyses' } };
    }
  },

  // Get risk analysis by ID
  getRiskAnalysisById: async (id) => {
    try {
      const response = await api.get(`/risk-analysis/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch risk analysis' } };
    }
  },

  // Create new risk analysis
  createRiskAnalysis: async (riskAnalysisData) => {
    try {
      const response = await api.post('/risk-analysis', riskAnalysisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to create risk analysis' } };
    }
  },

  // Update risk analysis
  updateRiskAnalysis: async (id, riskAnalysisData) => {
    try {
      const response = await api.put(`/risk-analysis/${id}`, riskAnalysisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to update risk analysis' } };
    }
  },

  // Delete risk analysis
  deleteRiskAnalysis: async (id) => {
    try {
      const response = await api.delete(`/risk-analysis/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to delete risk analysis' } };
    }
  }
};

export default RiskAnalysisService;
