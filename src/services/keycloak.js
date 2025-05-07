import Keycloak from "keycloak-js";

// Check if environment variables are defined
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM;
const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

// Log configuration for debugging
console.log("[KEYCLOAK_CLIENT] Configuration:", {
  url: keycloakUrl || "Not defined",
  realm: keycloakRealm || "Not defined",
  clientId: keycloakClientId || "Not defined",
});

// Validate configuration
if (!keycloakUrl || !keycloakRealm || !keycloakClientId) {
  console.error(
    "[KEYCLOAK_CLIENT] Configuration is incomplete. Please check your environment variables."
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
  console.log("[KEYCLOAK_CLIENT] Authentication success");
  
  // Log token details (safely)
  const token = keycloak.token;
  if (token) {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        
        console.log("[KEYCLOAK_CLIENT] Token header:", JSON.stringify(header));
        console.log("[KEYCLOAK_CLIENT] Token payload (partial):", JSON.stringify({
          iss: payload.iss,
          sub: payload.sub,
          aud: payload.aud,
          exp: payload.exp,
          iat: payload.iat,
          // Don't log sensitive information
        }));
        console.log("[KEYCLOAK_CLIENT] Token expiration:", new Date(payload.exp * 1000).toISOString());
        
        // Log roles if available
        if (payload.realm_access && payload.realm_access.roles) {
          console.log("[KEYCLOAK_CLIENT] User roles:", JSON.stringify(payload.realm_access.roles));
        }
      } catch (e) {
        console.error("[KEYCLOAK_CLIENT] Error parsing token:", e);
      }
    }
  }
};

keycloak.onAuthError = (error) => {
  console.error("[KEYCLOAK_CLIENT] Authentication error:", error);
};

keycloak.onAuthRefreshSuccess = () => {
  console.log("[KEYCLOAK_CLIENT] Authentication refresh success");
  
  // Log refreshed token details
  const token = keycloak.token;
  if (token) {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("[KEYCLOAK_CLIENT] Refreshed token expiration:", new Date(payload.exp * 1000).toISOString());
      } catch (e) {
        console.error("[KEYCLOAK_CLIENT] Error parsing refreshed token:", e);
      }
    }
  }
};

keycloak.onAuthRefreshError = (error) => {
  console.error("[KEYCLOAK_CLIENT] Authentication refresh error:", error);
};

keycloak.onAuthLogout = () => {
  console.log("[KEYCLOAK_CLIENT] Authentication logout");
};

keycloak.onTokenExpired = () => {
  console.log("[KEYCLOAK_CLIENT] Token expired, attempting to refresh");
  keycloak.updateToken(30);
};

// Helper functions for authentication
const keycloakService = {
  // Initialize Keycloak
  init: async () => {
    try {
      // If already initialized, return the current authentication state
      if (isInitialized) {
        console.log("[KEYCLOAK_CLIENT] Already initialized, returning current state:", keycloak.authenticated);
        return keycloak.authenticated;
      }
  
      console.log("[KEYCLOAK_CLIENT] Initializing with config:", {
        url: keycloakConfig.url,
        realm: keycloakConfig.realm,
        clientId: keycloakConfig.clientId,
      });
  
      // Try with different initialization options
      const authenticated = await keycloak.init({
        onLoad: "check-sso", 
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: "S256",
        checkLoginIframe: false,
        enableLogging: true, // Enable detailed logging
      });
  
      // Mark as initialized
      isInitialized = true;
  
      console.log(`[KEYCLOAK_CLIENT] Initialization complete. User is ${authenticated ? "authenticated" : "not authenticated"}`);
      
      return authenticated;
    } catch (error) {
      console.error("[KEYCLOAK_CLIENT] Failed to initialize:", error);
      // Log more details about the error
      if (error.error) {
        console.error("[KEYCLOAK_CLIENT] Error code:", error.error);
        console.error("[KEYCLOAK_CLIENT] Error description:", error.error_description);
      }
      return false;
    }
  },

  // Login with Keycloak
  login: () => {
    console.log("[KEYCLOAK_CLIENT] Starting login process");
    console.log("[KEYCLOAK_CLIENT] Redirect URI:", `${window.location.origin}/dashboard`);
    keycloak.login({
      redirectUri: `${window.location.origin}/dashboard`,
    });
  },

  // Logout from Keycloak
  logout: () => {
    console.log("[KEYCLOAK_CLIENT] Starting logout process");
    console.log("[KEYCLOAK_CLIENT] Redirect URI:", `${window.location.origin}/login`);
    keycloak.logout({
      redirectUri: `${window.location.origin}/login`,
    });
  },

  // Get user profile
  getUserInfo: async () => {
    try {
      console.log("[KEYCLOAK_CLIENT] Getting user profile information");
      if (keycloak.authenticated) {
        console.log("[KEYCLOAK_CLIENT] Loading user profile from Keycloak");
        const userInfo = await keycloak.loadUserProfile();
        console.log("[KEYCLOAK_CLIENT] User profile loaded:", JSON.stringify(userInfo));

        // Map Keycloak roles to application roles
        const roles = keycloak.realmAccess?.roles || [];
        console.log("[KEYCLOAK_CLIENT] User roles from token:", JSON.stringify(roles));
        
        let role = "user"; // Default role

        if (roles.includes("admin")) {
          role = "admin";
          console.log("[KEYCLOAK_CLIENT] User has admin role");
        } else if (roles.includes("manager")) {
          role = "manager";
          console.log("[KEYCLOAK_CLIENT] User has manager role");
        } else {
          console.log("[KEYCLOAK_CLIENT] User has default user role");
        }

        const mappedUser = {
          id: keycloak.subject,
          username: userInfo.username,
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          role: role,
          // Add any other user properties you need
        };
        
        console.log("[KEYCLOAK_CLIENT] Mapped user information:", JSON.stringify(mappedUser));
        return mappedUser;
      }
      console.log("[KEYCLOAK_CLIENT] User not authenticated, cannot get profile");
      return null;
    } catch (error) {
      console.error("[KEYCLOAK_CLIENT] Failed to load user profile", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const authenticated = keycloak.authenticated;
    console.log(`[KEYCLOAK_CLIENT] Authentication status: ${authenticated}`);
    return authenticated;
  },

  // Check if user has a specific role
  hasRole: (role) => {
    const hasRole = keycloak.hasRealmRole(role);
    console.log(`[KEYCLOAK_CLIENT] Checking if user has role '${role}': ${hasRole}`);
    return hasRole;
  },

  // Get access token
  getToken: () => {
    const token = keycloak.token;
    if (token) {
      console.log("[KEYCLOAK_CLIENT] Retrieved access token (first 10 chars):", token.substring(0, 10) + "...");
    } else {
      console.log("[KEYCLOAK_CLIENT] No access token available");
    }
    return token;
  },

  // Update token (refresh)
  updateToken: async (minValidity = 30) => {
    try {
      console.log(`[KEYCLOAK_CLIENT] Updating token with minimum validity: ${minValidity} seconds`);
      const refreshed = await keycloak.updateToken(minValidity);
      console.log(`[KEYCLOAK_CLIENT] Token ${refreshed ? "was refreshed" : "is still valid"}`);
      
      if (refreshed) {
        const token = keycloak.token;
        if (token) {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("[KEYCLOAK_CLIENT] New token expiration:", new Date(payload.exp * 1000).toISOString());
            } catch (e) {
              console.error("[KEYCLOAK_CLIENT] Error parsing new token:", e);
            }
          }
        }
      }
      
      return refreshed;
    } catch (error) {
      console.error("[KEYCLOAK_CLIENT] Failed to refresh token", error);
      console.log("[KEYCLOAK_CLIENT] Redirecting to login due to token refresh failure");
      keycloak.login();
      return false;
    }
  },

  // Get instance
  getInstance: () => keycloak,

  // Add this to the keycloakService object
  register: () => {
    console.log("[KEYCLOAK_CLIENT] Starting registration process");
    console.log("[KEYCLOAK_CLIENT] Redirect URI:", `${window.location.origin}/dashboard`);
    keycloak.register({
      redirectUri: `${window.location.origin}/dashboard`,
    });
  },
};

export default keycloakService;
