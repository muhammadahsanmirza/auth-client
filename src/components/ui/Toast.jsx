import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

// Toast component that provides the container
const Toast = () => {
  const { darkMode } = useSelector((state) => state.theme);
  
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={darkMode ? 'dark' : 'light'}
    />
  );
};

export const showSuccessToast = (message) => {
  toast.success(message, {
    icon: '✅',
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    icon: '❌',
  });
};

export const showInfoToast = (message) => {
  toast.info(message, {
    icon: 'ℹ️',
  });
};

export const showWarningToast = (message) => {
  toast.warning(message, {
    icon: '⚠️',
  });
};

export default Toast;