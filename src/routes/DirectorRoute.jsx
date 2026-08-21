import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useGetUser } from '@/hooks/auth/user-details.hook';

const DirectorRoute = () => {
  const { user, isLoading } = useGetUser();

  if (isLoading) return null;
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== 'director') {
    return <Navigate to="/owner/overview" replace />;
  }
  
  return <Outlet />;
};

export default DirectorRoute;
