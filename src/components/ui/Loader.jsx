import React from 'react';
import { Loader as MantineLoader, Center, Text, Paper } from '@mantine/core';
import { useSelector } from 'react-redux';

// Loader variants
export const LoaderVariant = {
  INLINE: 'inline',
  OVERLAY: 'overlay',
  FULLSCREEN: 'fullscreen',
};

const Loader = ({ 
  variant = LoaderVariant.INLINE, 
  size = 'md', 
  text = 'Loading...', 
  showText = true 
}) => {
  const { darkMode } = useSelector((state) => state.theme);
  
  // Inline loader - simple loader to be used within components
  if (variant === LoaderVariant.INLINE) {
    return (
      <Center className="py-4">
        <MantineLoader size={size} />
        {showText && (
          <Text 
            ml="sm" 
            size="sm"
            styles={(theme) => ({
              root: {
                color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7]
              }
            })}
          >
            {text}
          </Text>
        )}
      </Center>
    );
  }
  
  // Overlay loader - semi-transparent overlay for a specific container
  if (variant === LoaderVariant.OVERLAY) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 dark:bg-opacity-40 z-10">
        <Paper 
          p="md" 
          radius="md" 
          shadow="md"
          className="flex flex-col items-center"
          styles={(theme) => ({
            root: {
              backgroundColor: darkMode ? theme.colors.dark[7] : theme.white,
            }
          })}
        >
          <MantineLoader size={size} />
          {showText && (
            <Text 
              mt="xs" 
              size="sm"
              styles={(theme) => ({
                root: {
                  color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7]
                }
              })}
            >
              {text}
            </Text>
          )}
        </Paper>
      </div>
    );
  }
  
  // Fullscreen loader - covers the entire screen
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 dark:bg-opacity-50 z-50">
      <Paper 
        p="xl" 
        radius="md" 
        shadow="xl"
        className="flex flex-col items-center"
        styles={(theme) => ({
          root: {
            backgroundColor: darkMode ? theme.colors.dark[7] : theme.white,
          }
        })}
      >
        <MantineLoader size={size} />
        {showText && (
          <Text 
            mt="md" 
            size="md"
            styles={(theme) => ({
              root: {
                color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7]
              }
            })}
          >
            {text}
          </Text>
        )}
      </Paper>
    </div>
  );
};

export default Loader;