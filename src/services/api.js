import axios from 'axios';

// Determine the API URL based on the current environment
const getApiUrl = () => {
  // Check if we're running in production (on the actual domain)
  if (window.location.hostname === 'rodo.optiq-ai.pl') {
    // For production domain, use the same origin without port specification
    return `${window.location.protocol}//${window.location.hostname}/api/v1`;
  }
  // Default to localhost for development
  return process.env.REACT_APP_API_URL || 'http://localhost:3011/api/v1';
};

const API_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Disable credentials for cross-origin requests
});

// Log API configuration for debugging
console.log('API configured with baseURL:', API_URL);

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log('Received successful response from:', response.config.url);
    return response;
  },
  async (error) => {
    console.error('API response error:', error.response?.status, error.message, 'URL:', error.config?.url);
    
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          });
          
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        }
        
        // If refresh failed, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      } catch (_error) {
        console.error('Token refresh failed:', _error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
