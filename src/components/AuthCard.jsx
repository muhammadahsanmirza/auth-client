import React from 'react';
import { Paper, Title } from '@mantine/core';
import RegisterForm from './RegisterForm';
import ThemeToggle from './ThemeToggle';
import { useSelector } from 'react-redux';

const AuthCard = () => {
  const { darkMode } = useSelector((state) => state.theme);
  
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute top-2 right-2 z-10">
        <ThemeToggle />
      </div>
      <Paper
        radius="md"
        p={{ base: 'md', sm: 'xl' }}
        withBorder
        className="w-full shadow-lg"
        styles={(theme) => ({
          root: {
            backgroundColor: darkMode ? theme.colors.dark[7] : theme.white,
            borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[3],
          }
        })}
      >
        <Title 
          order={2} 
          align="center" 
          mb="lg"
          styles={(theme) => ({
            root: {
              color: darkMode ? theme.colors.gray[0] : theme.black,
              fontSize: '1.5rem',
            }
          })}
        >
          Create Your Account
        </Title>
        <RegisterForm />
      </Paper>
    </div>
  );
};

export default AuthCard;