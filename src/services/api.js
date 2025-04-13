import axios from 'axios';

// Determine the API URL based on the current environment
const getApiUrl = () => {
  // Check if we're running in production (on the actual domain)
  if (window.location.hostname === 'rodo.optiq-ai.pl') {
    return `${window.location.protocol}//${window.location.hostname}:3011/api/v1`;
  }
  // Default to localhost for development
  return process.env.REACT_APP_API_URL || 'http://localhost:3011/api/v1';
};

const API_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with cross-origin requests
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
    return response;
  },
  async (error) => {
    console.error('API response error:', error.response?.status, error.message);
    
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
