import api from './api';

// Incident service
const IncidentService = {
  // Get all incidents with pagination and filters
  getIncidents: async (params = {}) => {
    try {
      const response = await api.get('/incidents', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch incidents' } };
    }
  },

  // Get incident by ID
  getIncidentById: async (id) => {
    try {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch incident' } };
    }
  },

  // Create new incident
  createIncident: async (incidentData) => {
    try {
      const response = await api.post('/incidents', incidentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to create incident' } };
    }
  },

  // Update incident
  updateIncident: async (id, incidentData) => {
    try {
      const response = await api.put(`/incidents/${id}`, incidentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to update incident' } };
    }
  },

  // Delete incident
  deleteIncident: async (id) => {
    try {
      const response = await api.delete(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to delete incident' } };
    }
  }
};

export default IncidentService;
