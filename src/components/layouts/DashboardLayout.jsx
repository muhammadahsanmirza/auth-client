import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppShell, Button, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { FiHome, FiUser, FiSettings, FiLogOut, FiMenu } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';
import api from '../../services/api';
import { showSuccessToast } from '../ui/Toast';
import { logout } from '../../store/authSlice';
import keycloakService from '../../services/keycloak';

const DashboardLayout = ({ children }) => {
  const { darkMode } = useSelector((state) => state.theme);
  const { user, authProvider } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [opened, setOpened] = React.useState(false);

  const handleLogout = async () => {
    try {
      // Check which auth provider was used
      if (authProvider === 'keycloak') {
        // Logout from Keycloak
        dispatch(logout());
        keycloakService.logout();
      } else {
        // Logout from custom auth
        await api.logout();
        dispatch(logout());
        showSuccessToast('Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { icon: <FiHome size={20} />, label: 'Dashboard', onClick: () => navigate('/dashboard') },
    { icon: <FiUser size={20} />, label: 'Profile', onClick: () => navigate('/profile') },
    { icon: <FiSettings size={20} />, label: 'Settings', onClick: () => navigate('/settings') },
  ];

  return (
    <AppShell
      padding="md"
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      header={{ height: 60 }}
      styles={(theme) => ({
        main: {
          backgroundColor: darkMode ? theme.colors.dark[9] : theme.colors.gray[0],
        }
      })}
    >
      <AppShell.Header
        p="md"
        styles={(theme) => ({
          header: {
            backgroundColor: darkMode ? theme.colors.dark[7] : theme.white,
            borderBottom: `1px solid ${darkMode ? theme.colors.dark[5] : theme.colors.gray[2]}`,
          }
        })}
      >
        <div className="flex justify-between items-center h-full">
          <Group>
            <Button 
              variant="subtle"
              onClick={() => setOpened(!opened)}
              className="block sm:hidden"
            >
              <FiMenu size={20} />
            </Button>
            <Text 
              size="lg" 
              fw={700}
              styles={(theme) => ({
                root: {
                  color: darkMode ? theme.colors.gray[0] : theme.colors.gray[9],
                }
              })}
            >
              QuantrustPKI
            </Text>
          </Group>
          
          <Group>
            <Text 
              size="sm"
              styles={(theme) => ({
                root: {
                  color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
                }
              })}
            >
              {user?.Name || 'User'}
            </Text>
            <ThemeToggle />
          </Group>
        </div>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        styles={(theme) => ({
          navbar: {
            backgroundColor: darkMode ? theme.colors.dark[8] : theme.white,
            borderRight: `1px solid ${darkMode ? theme.colors.dark[5] : theme.colors.gray[2]}`,
          }
        })}
      >
        <AppShell.Section grow mt="md">
          {navItems.map((item, index) => (
            <UnstyledButton
              key={index}
              onClick={item.onClick}
              className="w-full py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 mb-2 transition-colors"
            >
              <Group>
                <ThemeIcon variant="light" size="md">
                  {item.icon}
                </ThemeIcon>
                <Text>{item.label}</Text>
              </Group>
            </UnstyledButton>
          ))}
        </AppShell.Section>
        
        <AppShell.Section>
          <UnstyledButton
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          >
            <Group>
              <ThemeIcon color="red" variant="light" size="md">
                <FiLogOut size={20} />
              </ThemeIcon>
              <Text>Logout</Text>
            </Group>
          </UnstyledButton>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;