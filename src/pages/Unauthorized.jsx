import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Title, Text, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';

const Unauthorized = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  return (
    <Container className="flex flex-col items-center justify-center min-h-screen text-center py-10">
      <FiLock size={80} className="text-red-500 mb-6" />
      
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
        403 - Access Denied
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
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </Text>
      
      <Button
        size="md"
        onClick={() => navigate('/dashboard')}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Go to Dashboard
      </Button>
    </Container>
  );
};

export default Unauthorized;