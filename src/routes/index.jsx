import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboard Pages
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import UserDashboard from '../pages/dashboard/UserDashboard';

// Error Pages
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

// Layouts
import MainLayout from '../components/layouts/MainLayout';
import DashboardLayout from '../components/layouts/DashboardLayout';

// Auth Components
import RoleBasedRoute from '../components/auth/RoleBasedRoute';
import { useSelector } from 'react-redux';

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Redirect based on user role
  switch(user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    default:
      return <UserDashboard />;
  }
};

// Create router
const router = createBrowserRouter([
  // Public routes (auth)
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <MainLayout>
        <Login />
      </MainLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <MainLayout>
        <Register />
      </MainLayout>
    ),
  },
  
  // Protected routes with role-based access
  {
    path: '/dashboard',
    element: (
      <RoleBasedRoute allowedRoles={['admin', 'manager', 'user']}>
        <DashboardLayout>
          <DashboardRouter />
        </DashboardLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <RoleBasedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      </RoleBasedRoute>
    ),
  },
  {
    path: '/manager',
    element: (
      <RoleBasedRoute allowedRoles={['admin', 'manager']}>
        <DashboardLayout>
          <ManagerDashboard />
        </DashboardLayout>
      </RoleBasedRoute>
    ),
  },
  
  // Error pages
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;