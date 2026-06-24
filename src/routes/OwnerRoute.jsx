import React from 'react';
import { Navigate, Outlet } from 'react-router';

const OwnerRoute = () => {

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'owner') {
    return <Navigate to="/director/overview" replace />;
  }

  return <Outlet />;
};

export default OwnerRoute;