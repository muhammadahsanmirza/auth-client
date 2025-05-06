import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import keycloakService from '../../services/keycloak';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, authProvider } = useSelector((state) => state.auth);
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check roles based on auth provider
  let hasRequiredRole = false;
  
  if (authProvider === 'keycloak') {
    // For Keycloak, check if user has any of the allowed roles
    hasRequiredRole = allowedRoles.some(role => keycloakService.hasRole(role));
  } else {
    // For custom auth, check if user's role is in allowed roles
    hasRequiredRole = allowedRoles.includes(user?.role);
  }
  
  // If authenticated but role not allowed, redirect to unauthorized
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If authenticated and role is allowed, render the children
  return children;
};

export default RoleBasedRoute;