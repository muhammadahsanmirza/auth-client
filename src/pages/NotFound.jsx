import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Title, Text, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  return (
    <Container className="flex flex-col items-center justify-center min-h-screen text-center py-10">
      <FiAlertTriangle size={80} className="text-yellow-500 mb-6" />
      
      <Title 
        order={1} 
        className="mb-4"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[0] : theme.colors.gray[9],
            fontSize: '2.5rem'
          }
        })}
      >
        404 - Page Not Found
      </Title>
      
      <Text 
        size="lg" 
        className="mb-8 max-w-md"
        styles={(theme) => ({
          root: {
            color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
          }
        })}
      >
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Text>
      
      <Button
        size="md"
        onClick={() => navigate('/')}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Go to Homepage
      </Button>
    </Container>
  );
};

export default NotFound;