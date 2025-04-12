import api from './api';

// Document service
const DocumentService = {
  // Get all documents with pagination and filters
  getDocuments: async (params = {}) => {
    try {
      const response = await api.get('/documents', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch documents' } };
    }
  },

  // Get document by ID
  getDocumentById: async (id) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch document' } };
    }
  },

  // Create new document
  createDocument: async (documentData) => {
    try {
      const response = await api.post('/documents', documentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to create document' } };
    }
  },

  // Update document
  updateDocument: async (id, documentData) => {
    try {
      const response = await api.put(`/documents/${id}`, documentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to update document' } };
    }
  },

  // Delete document
  deleteDocument: async (id) => {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to delete document' } };
    }
  },

  // Get document versions
  getDocumentVersions: async (id) => {
    try {
      const response = await api.get(`/documents/${id}/versions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: { message: 'Failed to fetch document versions' } };
    }
  }
};

export default DocumentService;
