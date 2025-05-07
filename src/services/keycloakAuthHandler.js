import { keycloakLoginSuccess, logout } from '../store/authSlice';
import keycloakService from './keycloak';
import api from './api';

// Function to handle Keycloak authentication
export const handleKeycloakAuth = async (store) => {
  try {
    console.log('[KEYCLOAK_HANDLER] Checking for Keycloak authentication');
    
    // Initialize Keycloak
    const authenticated = await keycloakService.init();
    
    if (authenticated) {
      console.log('[KEYCLOAK_HANDLER] User is authenticated with Keycloak');
      
      // Get the token
      const token = keycloakService.getToken();
      console.log('[KEYCLOAK_HANDLER] Retrieved token from Keycloak',token);
      
      try {
        // Get user info from Keycloak
        const userInfo = await keycloakService.getUserInfo();
        
        // Sync with backend
        const response = await api.post('/auth/keycloak-sync', {
          keycloakUser: userInfo
        });
        
        // Dispatch login success action
        store.dispatch(keycloakLoginSuccess(response.data.data.user));
        
        console.log('[KEYCLOAK_HANDLER] User successfully authenticated and synced');
      } catch (error) {
        console.error('[KEYCLOAK_HANDLER] Error syncing user:', error);
        
        // Check if error is due to user being deleted from Keycloak but still in DB
        if (error.response && error.response.status === 401) {
          console.log('[KEYCLOAK_HANDLER] User may have been deleted from Keycloak. Logging out.');
          // Log the user out from Keycloak
          keycloakService.logout();
          // Clear local auth state
          store.dispatch(logout());
        }
      }
    } else {
      console.log('[KEYCLOAK_HANDLER] User is not authenticated with Keycloak');
    }
  } catch (error) {
    console.error('[KEYCLOAK_HANDLER] Error during Keycloak authentication:', error);
  }
};

// Function to handle Keycloak logout
export const handleKeycloakLogout = (store) => {
  console.log('[KEYCLOAK_HANDLER] Starting Keycloak logout process');
  
  // Dispatch the logout action
  console.log('[KEYCLOAK_HANDLER] Dispatching logout action');
  store.dispatch(logout());
  
  // Logout from Keycloak
  console.log('[KEYCLOAK_HANDLER] Calling Keycloak logout');
  keycloakService.logout();
};

// Function to check if token needs refresh
export const checkKeycloakToken = async () => {
  try {
    console.log('[KEYCLOAK_HANDLER] Checking if Keycloak token needs refresh');
    if (keycloakService.isAuthenticated()) {
      // Try to refresh the token if it's close to expiry
      console.log('[KEYCLOAK_HANDLER] User is authenticated, updating token');
      await keycloakService.updateToken(30);
      return true;
    }
    console.log('[KEYCLOAK_HANDLER] User is not authenticated');
    return false;
  } catch (error) {
    console.error('[KEYCLOAK_HANDLER] Error refreshing Keycloak token:', error);
    return false;
  }
};