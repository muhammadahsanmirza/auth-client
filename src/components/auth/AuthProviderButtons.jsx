import React from 'react';
import { Button } from '@mantine/core';
import { FcGoogle } from "react-icons/fc";
import { BsBuilding } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import keycloakService from '../../services/keycloak';
import { showErrorToast } from '../../components/ui/Toast';

const AuthProviderButtons = ({ onSSOAction, ssoButtonText = "Use Organization SSO", googleButtonText = "Continue with Google", onGoogleAction }) => {
  const { darkMode } = useSelector((state) => state.theme);
  
  const handleSSOLogin = async () => {
    try {
      console.log('[AUTH_BUTTONS] SSO login button clicked');
      // First check if keycloakService exists
      if (!keycloakService) {
        console.error('[AUTH_BUTTONS] Keycloak service is not available');
        showErrorToast('SSO service is not available. Please try again later.');
        return;
      }
      
      console.log('[AUTH_BUTTONS] Starting Keycloak initialization...');
      
      // Initialize Keycloak if not already initialized
      const isAuthenticated = await keycloakService.init();
      
      console.log('[AUTH_BUTTONS] Keycloak initialization result:', isAuthenticated);
      
      // If already authenticated, redirect to dashboard
      if (isAuthenticated) {
        console.log('[AUTH_BUTTONS] User is already authenticated, redirecting to dashboard');
        window.location.href = `${window.location.origin}/dashboard`;
        return;
      }
      
      // Otherwise, proceed with login
      console.log('[AUTH_BUTTONS] User is not authenticated, proceeding with Keycloak login...');
      keycloakService.login();
    } catch (error) {
      console.error('[AUTH_BUTTONS] Error during SSO login:', error);
      showErrorToast('Failed to connect to SSO service. Please try again later.');
    }
  };
  
  const handleGoogleAction = () => {
    if (onGoogleAction) {
      onGoogleAction();
    } else {
      // Default Google action if none provided
      console.log('Google authentication not implemented');
      showErrorToast('Google authentication is not available yet.');
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
      <Button 
        variant="outline" 
        className="border border-gray-300 dark:border-gray-600 w-full"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
            borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[4],
            padding: '0 12px',
            height: '40px',
            fontSize: '14px'
          },
          inner: {
            justifyContent: 'center'
          }
        })}
        leftSection={<FcGoogle size={18} />}
        onClick={handleGoogleAction}
      >
        {googleButtonText}
      </Button> 
      
      <Button 
        variant="outline" 
        className="border border-gray-300 dark:border-gray-600 w-full"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
            borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[4],
            padding: '0 12px',
            height: '40px',
            fontSize: '14px'
          },
          inner: {
            justifyContent: 'center'
          }
        })}
        leftSection={<BsBuilding size={18} />}
        onClick={handleSSOLogin}
      >
        {ssoButtonText}
      </Button>
    </div>
  );
};

export default AuthProviderButtons;