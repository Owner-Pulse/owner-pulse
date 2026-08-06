import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useGetUser } from '@/hooks';

const OwnerRoute = () => {
  const { user, isLoading } = useGetUser();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'owner') {
    return <Navigate to="/director/overview" replace />;
  }

  return <Outlet />;
};

export default OwnerRoute;