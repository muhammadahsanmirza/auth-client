import Keycloak from "keycloak-js";

// Check if environment variables are defined
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM;
const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

// Log configuration for debugging
console.log("Keycloak Configuration:", {
  url: keycloakUrl || "Not defined",
  realm: keycloakRealm || "Not defined",
  clientId: keycloakClientId || "Not defined",
});

// Validate configuration
if (!keycloakUrl || !keycloakRealm || !keycloakClientId) {
  console.error(
    "Keycloak configuration is incomplete. Please check your environment variables."
  );
}

const keycloakConfig = {
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
};

const keycloak = new Keycloak(keycloakConfig);

// Track initialization state
let isInitialized = false;

// Add event listeners for authentication events
keycloak.onAuthSuccess = () => {
  console.log("Auth success");
};

keycloak.onAuthError = (error) => {
  console.error("Auth error:", error);
};

keycloak.onAuthRefreshSuccess = () => {
  console.log("Auth refresh success");
};

keycloak.onAuthRefreshError = (error) => {
  console.error("Auth refresh error:", error);
};

keycloak.onAuthLogout = () => {
  console.log("Auth logout");
};

keycloak.onTokenExpired = () => {
  console.log("Token expired");
  keycloak.updateToken(30);
};

// Helper functions for authentication
const keycloakService = {
  // Initialize Keycloak
  init: async () => {
    try {
      // If already initialized, return the current authentication state
      if (isInitialized) {
        console.log("Keycloak already initialized, returning current state");
        return keycloak.authenticated;
      }

      console.log("Initializing Keycloak with config:", {
        url: keycloakConfig.url,
        realm: keycloakConfig.realm,
        clientId: keycloakConfig.clientId,
      });

      // Try with different initialization options
      const authenticated = await keycloak.init({
        onLoad: "check-sso", // Changed from 'login-required' to avoid immediate redirect
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: "S256",
        checkLoginIframe: false,
        enableLogging: true, // Enable detailed logging
      });

      // Mark as initialized
      isInitialized = true;

      console.log(
        `User is ${authenticated ? "authenticated" : "not authenticated"}`
      );
      return authenticated;
    } catch (error) {
      console.error("Failed to initialize Keycloak", error);
      return false;
    }
  },

  // Login with Keycloak
  login: () => {
    keycloak.login({
      redirectUri: `${window.location.origin}/dashboard`,
    });
  },

  // Logout from Keycloak
  logout: () => {
    keycloak.logout({
      redirectUri: `${window.location.origin}/login`,
    });
  },

  // Get user profile
  getUserInfo: async () => {
    try {
      if (keycloak.authenticated) {
        const userInfo = await keycloak.loadUserProfile();

        // Map Keycloak roles to application roles
        const roles = keycloak.realmAccess?.roles || [];
        let role = "user"; // Default role

        if (roles.includes("admin")) {
          role = "admin";
        } else if (roles.includes("manager")) {
          role = "manager";
        }

        return {
          id: keycloak.subject,
          username: userInfo.username,
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          role: role,
          // Add any other user properties you need
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to load user profile", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => keycloak.authenticated,

  // Check if user has a specific role
  hasRole: (role) => {
    return keycloak.hasRealmRole(role);
  },

  // Get access token
  getToken: () => keycloak.token,

  // Update token (refresh)
  updateToken: async (minValidity = 30) => {
    try {
      const refreshed = await keycloak.updateToken(minValidity);
      return refreshed;
    } catch (error) {
      console.error("Failed to refresh token", error);
      keycloak.login();
      return false;
    }
  },

  // Get instance
  getInstance: () => keycloak,

  // Add this to the keycloakService object
  register: () => {
    keycloak.register({
      redirectUri: `${window.location.origin}/dashboard`,
    });
  },
};

export default keycloakService;
