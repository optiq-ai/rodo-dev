import api from './api';

// Request service
const RequestService = {
  // Get all requests with pagination and filters
  getRequests: async (params = {}) => {
    try {
      const response = await api.get('/requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch requests' } };
    }
  },

  // Get request by ID
  getRequestById: async (id: any) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch request' } };
    }
  },

  // Create new request
  createRequest: async (requestData: any) => {
    try {
      const response = await api.post('/requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to create request' } };
    }
  },

  // Update request
  updateRequest: async (id: any, requestData: any) => {
    try {
      const response = await api.put(`/requests/${id}`, requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to update request' } };
    }
  },

  // Delete request
  deleteRequest: async (id: any) => {
    try {
      const response = await api.delete(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to delete request' } };
    }
  }
};

export default RequestService;
