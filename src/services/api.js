import axios from 'axios';
// Remove the direct store import
import { logout } from '../store/authSlice';
import keycloakService from './keycloak';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
console.log('[API_SERVICE] Initializing with API URL:', API_URL);

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Create a variable to hold the store reference
let storeRef = null;

// Function to set the store reference
export const setStore = (store) => {
  storeRef = store;
  console.log('[API_SERVICE] Store reference set');
};

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    console.log(`[API] Making ${config.method.toUpperCase()} request to: ${config.url}`);
    console.log(`[API] Request data:`, config.data);
    console.log(`[API] Request headers:`, config.headers);
    
    if (storeRef) {
      const state = storeRef.getState();
      
      if (state.auth.isAuthenticated) {
        console.log(`[API] User is authenticated, auth provider: ${state.auth.authProvider || 'unknown'}`);
        
        // If using Keycloak, check if token needs refresh
        if (state.auth.authProvider === 'keycloak') {
          console.log('[API] Using Keycloak authentication, checking token');
          try {
            const refreshed = await keycloakService.updateToken(30);
            console.log(`[API] Token refresh check result: ${refreshed ? 'refreshed' : 'still valid'}`);
            
            const token = keycloakService.getToken();
            if (token) {
              console.log('[API] Adding Keycloak token to request headers');
              config.headers.Authorization = `Bearer ${token}`;
            } else {
              console.log('[API] No Keycloak token available');
            }
          } catch (error) {
            console.error('[API] Error refreshing Keycloak token:', error);
          }
        } else {
          console.log('[API] Using local authentication');
        }
      } else {
        console.log('[API] User is not authenticated');
      }
    } else {
      console.log('[API] Store reference not set, skipping auth check');
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response received from ${response.config.url}, status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`[API] Response error:`, error);
    
    if (error.response) {
      console.log(`[API] Error status: ${error.response.status}, message: ${error.response.data?.message || 'Unknown error'}`);
      
      if (error.response.status === 401 && storeRef) {
        console.log('[API] Unauthorized error (401), logging out user');
        storeRef.dispatch(logout());
      }
    } else if (error.request) {
      console.error('[API] No response received from server');
    } else {
      console.error('[API] Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    console.log('[API] Setting auth token (first 10 chars):', token.substring(0, 10) + '...');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    console.log('[API] Removing auth token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Define API methods object with specific endpoints
const apiService = {
  // Auth endpoints
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getUserProfile: () => api.get('/auth/profile'),
  
  // Keycloak integration
  keycloakSync: (data) => api.post('/auth/keycloak-sync', data),
  
  // User management
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  
  // Admin user management
  getAllUsers: () => api.get('/users'),
  updateUserRole: (data) => api.patch('/users/role', data),
  
  // Utility methods
  setAuthToken,
  setStore,
  
  // Allow direct access to the axios instance for custom calls
  request: (config) => api(config),
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config)
};

export default apiService;
