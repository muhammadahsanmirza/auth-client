import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Text, Stack } from '@mantine/core';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from './ui/Toast';
import Loader, { LoaderVariant } from './ui/Loader';
import AuthProviderButtons from './auth/AuthProviderButtons';
import { NavLink } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice'; // Import the login action

const schema = yup.object().shape({
  Name: yup
    .string()
    .required('Name is required')
    .matches(/^[^0-9].*$/, 'Name cannot start with a number'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password must not exceed 20 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match')
});

const RegisterForm = () => {
  const { darkMode } = useSelector((state) => state.theme);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, setError, clearErrors, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur', // Validate on blur
    defaultValues: {
      Name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    delete data.confirmPassword;
    console.log('[REGISTER] Form data:', { ...data, password: '******' });
    console.log('[REGISTER] API URL from env:', import.meta.env.VITE_API_URL);
    
    setApiError('');
    setLoading(true);
    try {
      console.log('[REGISTER] Sending registration request to:', '/auth/signup', data);
      
      // Try with direct axios call to see if that helps
      const res = await api.post('/auth/signup', data);
      
      console.log('[REGISTER] Registration successful, response:', res);
      console.log('[REGISTER] Response data:', res.data);
      
      showSuccessToast(res.data.message || 'Registration successful!');
      
      // Store user data in Redux store
      if (res.data.data && res.data.data.user) {
        // Set the auth token for future API calls
        if (res.data.data.tokens && res.data.data.tokens.accessToken) {
          api.setAuthToken(res.data.data.tokens.accessToken);
        }
        
        // Dispatch login action to update Redux state
        dispatch(loginSuccess({
          user: res.data.data.user,
          authProvider: 'local'
        }));
        
        // Redirect to dashboard
        console.log('[REGISTER] Redirecting to dashboard');
        navigate('/dashboard');
      }
      
      reset();
      
    } catch (error) {
      console.error('[REGISTER] Registration failed:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('[REGISTER] Error response status:', error.response.status);
        console.error('[REGISTER] Error response data:', error.response.data);
        console.error('[REGISTER] Error response headers:', error.response.headers);
        
        // If there's a specific error message from the server, use it
        if (error.response.data && error.response.data.message) {
          showErrorToast(error.response.data.message);
          setApiError(error.response.data.message);
        } else {
          showErrorToast('Registration failed. Please try again.');
          setApiError('Registration failed. Please try again.');
        }
      } else if (error.request) {
        console.error('[REGISTER] No response received:', error.request);
        showErrorToast('No response from server. Please check your connection.');
        setApiError('No response from server. Please check your connection.');
      } else {
        console.error('[REGISTER] Error setting up request:', error.message);
        showErrorToast('Error setting up request: ' + error.message);
        setApiError('Error setting up request: ' + error.message);
      }
      
      if (error.response?.data?.errors) {
        console.error('[REGISTER] Field validation errors:', error.response.data.errors);
        const fieldErrors = error.response.data.errors;
        Object.keys(fieldErrors).forEach(field => {
          setError(field, { 
            type: 'server', 
            message: fieldErrors[field].message 
          });
        });
      }
    } finally {
      setLoading(false);
      console.log('[REGISTER] Registration process completed');
    }
  };

  const handleFocus = (fieldName) => {
    clearErrors(fieldName);
    if (apiError) setApiError('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full relative">
      {loading && (
        <div className="absolute inset-0 z-10">
          <Loader 
            variant={LoaderVariant.OVERLAY} 
            text="Creating your account..." 
          />
        </div>
      )}
      
      <Stack spacing="md">
        <TextInput
          required
          label="Name"
          placeholder="John Doe"
          {...register('Name')}
          error={errors.Name?.message}
          onFocus={() => handleFocus('Name')}
          icon={<FiUser />}
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
        
        <PasswordInput
          required
          label="Confirm Password"
          placeholder="Confirm your password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          onFocus={() => handleFocus('confirmPassword')}
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
        
        {apiError && !errors.email && !errors.password && !errors.Name && (
          <Text c="red">{apiError}</Text>
        )}
        
        <Button 
          type="submit" 
          loading={loading}
          fullWidth
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 mt-2"
        >
          Create Account
        </Button>        
        
        <Text 
          align="center" 
          size="sm"
          className="my-2"
        >
          Or sign up with
        </Text>

        <AuthProviderButtons />
        
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
          Already have an account?{' '}
          <NavLink to="/login" className="text-blue-500 hover:underline">
            Log in
          </NavLink>
        </Text>
      </Stack>
    </form>
  );
};

export default RegisterForm;