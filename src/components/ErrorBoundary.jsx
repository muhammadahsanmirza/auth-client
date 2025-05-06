import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button, Container, Title, Text } from '@mantine/core';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Container className="flex flex-col items-center justify-center min-h-screen text-center py-10">
      <Title order={1} className="mb-4">Something went wrong</Title>
      <Text size="lg" className="mb-8">
        We're sorry, an unexpected error has occurred.
      </Text>
      <Button 
        onClick={resetErrorBoundary}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Reload Page
      </Button>
    </Container>
  );
};

const ErrorBoundary = ({ children }) => {
  const handleReset = () => {
    // Optional: You can add additional reset logic here
    window.location.reload();
  };

  const logError = (error, info) => {
    // You can log the error to an error reporting service here
    console.error("Uncaught error:", error, info);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={handleReset}
      onError={logError}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;