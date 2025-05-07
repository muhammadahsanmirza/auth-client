import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import keycloakService from '../../services/keycloak';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, authProvider } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Add debugging logs
  console.log('[ROLE_BASED_ROUTE] Checking access for path:', location.pathname);
  console.log('[ROLE_BASED_ROUTE] Auth state:', { isAuthenticated, authProvider });
  console.log('[ROLE_BASED_ROUTE] User:', user);
  console.log('[ROLE_BASED_ROUTE] Allowed roles:', allowedRoles);
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[ROLE_BASED_ROUTE] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If no roles are required or allowedRoles is empty, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    console.log('[ROLE_BASED_ROUTE] No roles required, granting access');
    return children;
  }
  
  // Check roles based on auth provider
  let hasRequiredRole = false;
  
  if (authProvider === 'keycloak') {
    // For Keycloak, check if user has any of the allowed roles
    hasRequiredRole = allowedRoles.some(role => keycloakService.hasRole(role));
    console.log('[ROLE_BASED_ROUTE] Keycloak role check result:', hasRequiredRole);
  } else {
    // For custom auth, check if user's role is in allowed roles
    // Make sure user and user.role exist before checking
    if (user && user.role) {
      hasRequiredRole = allowedRoles.includes(user.role);
      console.log('[ROLE_BASED_ROUTE] Local auth role check:', { 
        userRole: user.role, 
        hasRequiredRole 
      });
    } else {
      console.log('[ROLE_BASED_ROUTE] User or user.role is undefined');
      // If user has no role but is authenticated, default to basic access
      // This handles newly registered users who might not have a role yet
      hasRequiredRole = allowedRoles.includes('user');
      console.log('[ROLE_BASED_ROUTE] Defaulting to basic user access:', hasRequiredRole);
    }
  }
  
  // If authenticated but role not allowed, redirect to unauthorized
  if (!hasRequiredRole) {
    console.log('[ROLE_BASED_ROUTE] Required role not found, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If authenticated and role is allowed, render the children
  console.log('[ROLE_BASED_ROUTE] Access granted');
  return children;
};

export default RoleBasedRoute;