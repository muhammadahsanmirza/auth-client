import { keycloakLoginSuccess, logout } from '../store/authSlice';
import keycloakService from './keycloak';
import api from './api';

// Function to handle Keycloak authentication
export const handleKeycloakAuth = async (store) => {
  try {
    // Initialize Keycloak
    const isAuthenticated = await keycloakService.init();
    
    if (isAuthenticated) {
      // Get the token
      const token = keycloakService.getToken();
      
      // Set the token in the API service
      api.setAuthToken(token);
      
      // Get user info from our backend
      const response = await api.get('/auth/user');
      
      if (response.data && response.data.success) {
        // Dispatch the login success action
        store.dispatch(keycloakLoginSuccess(response.data.data));
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error handling Keycloak authentication:', error);
    return false;
  }
};

// Function to handle Keycloak logout
export const handleKeycloakLogout = (store) => {
  // Dispatch the logout action
  store.dispatch(logout());
  
  // Logout from Keycloak
  keycloakService.logout();
};

// Function to check if token needs refresh
export const checkKeycloakToken = async () => {
  try {
    if (keycloakService.isAuthenticated()) {
      // Try to refresh the token if it's close to expiry
      await keycloakService.updateToken(30);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing Keycloak token:', error);
    return false;
  }
};