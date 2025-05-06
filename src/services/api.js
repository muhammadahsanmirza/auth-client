import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/authSlice';
import { checkKeycloakToken } from './keycloakAuthHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    
    if (state.auth.isAuthenticated) {
      // If using Keycloak, check if token needs refresh
      if (state.auth.authProvider === 'keycloak') {
        await checkKeycloakToken();
        const token = keycloakService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logout user on auth error
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default {
  ...api,
  setAuthToken,
};
