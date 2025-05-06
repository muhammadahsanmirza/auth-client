import React from 'react';
import { useSelector } from 'react-redux';
import { Title, Text, Paper, SimpleGrid, Group, ThemeIcon } from '@mantine/core';
import { FiUsers, FiClipboard, FiCheckSquare, FiFileText } from 'react-icons/fi';

const ManagerDashboard = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  const features = [
    { title: 'Team Management', icon: <FiUsers size={20} />, color: 'blue' },
    { title: 'Project Overview', icon: <FiClipboard size={20} />, color: 'green' },
    { title: 'Task Assignment', icon: <FiCheckSquare size={20} />, color: 'orange' },
    { title: 'Reports', icon: <FiFileText size={20} />, color: 'violet' }
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
        Manager Dashboard
      </Title>
      
      <Text 
        className="mb-6"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
          }
        })}
      >
        Welcome back, {user?.Name || 'Manager'}! You have access to team and project management features.
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

export default ManagerDashboard;