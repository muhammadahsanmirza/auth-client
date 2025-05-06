import React, { useState } from 'react';
import { Paper, Title, TextInput, PasswordInput, Button, Text, Stack } from '@mantine/core';
import { FiMail, FiLock } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import ThemeToggle from '../../components/ThemeToggle';
import AuthProviderButtons from '../../components/auth/AuthProviderButtons';
import { authAPI } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../components/ui/Toast';
import Loader, { LoaderVariant } from '../../components/ui/Loader';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
// Define validation schema with Yup
const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
});

const Login = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Initialize React Hook Form
  const { register, handleSubmit, formState: { errors }, clearErrors } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Form submission handler
  const onSubmit = async (data) => {
    // Clear any previous API errors
    setApiError('');
    
    // Set loading state and dispatch login start
    setLoading(true);
    dispatch(loginStart());
    
    try {
      // Make the API call
      const response = await authAPI.login(data);
      
      // Store user data in Redux
      dispatch(loginSuccess(response.data.user));
      
      // Show success message
      showSuccessToast(response.message || 'Login successful! Welcome back.');
      
      // Redirect based on user role
      const userRole = response.data.user.role;
      navigate('/dashboard');
      
    } catch (error) {
      // Handle error
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(errorMessage));
      showErrorToast(errorMessage);
      
      // Set API error message
      setApiError(errorMessage);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  // Handle focus to clear errors
  const handleFocus = (fieldName) => {
    clearErrors(fieldName);
    if (apiError) setApiError('');
  };

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
          Log in to Your Account
        </Title>
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-full relative">
          {loading && (
            <div className="absolute inset-0 z-10">
              <Loader 
                variant={LoaderVariant.OVERLAY} 
                text="Logging in..." 
              />
            </div>
          )}
          
          <Stack spacing="md">
            <TextInput
              required
              label="Email Address"
              placeholder="your@email.com"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              onFocus={() => handleFocus('email')}
              icon={<FiMail />}
              className="w-full"
              styles={(theme) => ({
                label: {
                  color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
                  fontSize: '0.875rem',
                  marginBottom: '4px'
                },
                input: {
                  backgroundColor: darkMode ? theme.colors.dark[5] : theme.white,
                  color: darkMode ? theme.colors.gray[0] : theme.colors.gray[9],
                  borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[4],
                  height: '40px'
                }
              })}
            />
            
            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              {...register('password')}
              error={errors.password?.message}
              onFocus={() => handleFocus('password')}
              icon={<FiLock />}
              className="w-full"
              styles={(theme) => ({
                label: {
                  color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7],
                  fontSize: '0.875rem',
                  marginBottom: '4px'
                },
                input: {
                  backgroundColor: darkMode ? theme.colors.dark[5] : theme.white,
                  color: darkMode ? theme.colors.gray[0] : theme.colors.gray[9],
                  borderColor: darkMode ? theme.colors.dark[4] : theme.colors.gray[4],
                  height: '40px'
                },
                innerInput: {
                  color: darkMode ? theme.colors.gray[0] : theme.colors.gray[9]
                }
              })}
            />
            
            <div className="flex justify-end">
              <Text 
                size="sm" 
                className="text-blue-500 hover:underline cursor-pointer"
                styles={(theme) => ({
                  root: {
                    color: theme.colors.blue[5],
                  }
                })}
              >
                Forgot password?
              </Text>
            </div>
            
            {apiError && (
              <Text c="red">{apiError}</Text>
            )}
            
            <Button 
              type="submit" 
              loading={loading}
              fullWidth
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 mt-2"
            >
              Log In
            </Button>        
            
            <Text 
              align="center" 
              size="sm"
              className="my-2"
            >
              Or log in with
            </Text>

            <AuthProviderButtons 
              ssoButtonText="Sign in with Organization SSO"
              googleButtonText="Sign in with Google"
              onSSOAction={() => keycloakService.login()}
              onGoogleAction={() => console.log('Google login not implemented yet')}
            />
            
            <Text 
              align="center" 
              size="sm"
              className="mt-4"
              styles={(theme) => ({
                root: {
                  color: darkMode ? theme.colors.gray[3] : theme.colors.gray[7]
                }
              })}
            >
              Don't have an account?{' '}
              <NavLink to="/register" className="text-blue-500 hover:underline">
                Sign up
              </NavLink>
            </Text>
          </Stack>
        </form>
      </Paper>
    </div>
  );
};

export default Login;