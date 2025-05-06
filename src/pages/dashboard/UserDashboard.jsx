import React from 'react';
import { useSelector } from 'react-redux';
import { Title, Text, Paper, SimpleGrid, Group, ThemeIcon } from '@mantine/core';
import { FiUser, FiCheckSquare, FiBell, FiMessageSquare } from 'react-icons/fi';

const UserDashboard = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  const features = [
    { title: 'Profile', icon: <FiUser size={20} />, color: 'blue' },
    { title: 'Tasks', icon: <FiCheckSquare size={20} />, color: 'green' },
    { title: 'Notifications', icon: <FiBell size={20} />, color: 'orange' },
    { title: 'Messages', icon: <FiMessageSquare size={20} />, color: 'violet' }
  ];

  return (
    <div className="p-6">
      <Title 
        order={2} 
        className="mb-6"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[0] : theme.colors.gray[9],
          }
        })}
      >
        User Dashboard
      </Title>
      
      <Text 
        className="mb-6"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
          }
        })}
      >
        Welcome back, {user?.Name || 'User'}! Here's your personal dashboard.
      </Text>
      
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {features.map((feature, index) => (
          <Paper
            key={index}
            p="md"
            radius="md"
            withBorder
            className="cursor-pointer hover:shadow-md transition-shadow"
            styles={(theme) => ({
              root: {
                backgroundColor: darkMode ? theme.colors.dark[6] : theme.white,
                borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[3],
              }
            })}
          >
            <Group>
              <ThemeIcon color={feature.color} variant="light" size="lg" radius="md">
                {feature.icon}
              </ThemeIcon>
              <Text weight={500}>{feature.title}</Text>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </div>
  );
};

export default UserDashboard;