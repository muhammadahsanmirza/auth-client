import React from 'react';
import { useSelector } from 'react-redux';

const MainLayout = ({ children }) => {
  const { darkMode } = useSelector((state) => state.theme);
  
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-2 sm:p-4 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {children}
    </div>
  );
};

export default MainLayout;