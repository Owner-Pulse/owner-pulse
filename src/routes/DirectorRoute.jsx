import React from 'react';
import { Navigate, Outlet } from 'react-router';

const DirectorRoute = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== 'director') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export default DirectorRoute;
