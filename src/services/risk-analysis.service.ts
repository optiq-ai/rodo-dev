import api from './api';

// Risk Analysis service
const RiskAnalysisService = {
  // Get all risk analyses with pagination and filters
  getRiskAnalyses: async (params = {}) => {
    try {
      const response = await api.get('/risk-analyses', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch risk analyses' } };
    }
  },

  // Get risk analysis by ID
  getRiskAnalysisById: async (id: any) => {
    try {
      const response = await api.get(`/risk-analyses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch risk analysis' } };
    }
  },

  // Create new risk analysis
  createRiskAnalysis: async (riskAnalysisData: any) => {
    try {
      const response = await api.post('/risk-analyses', riskAnalysisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to create risk analysis' } };
    }
  },

  // Update risk analysis
  updateRiskAnalysis: async (id: any, riskAnalysisData: any) => {
    try {
      const response = await api.put(`/risk-analyses/${id}`, riskAnalysisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to update risk analysis' } };
    }
  },

  // Delete risk analysis
  deleteRiskAnalysis: async (id: any) => {
    try {
      const response = await api.delete(`/risk-analyses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to delete risk analysis' } };
    }
  }
};

export default RiskAnalysisService;
