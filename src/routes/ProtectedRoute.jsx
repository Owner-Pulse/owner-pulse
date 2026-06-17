import React from 'react';
import { Navigate, Outlet } from 'react-router';

export const ProtectedRoute = ({ allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const basePath = user.role === 'owner' ? '/owner' : '/director';

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={basePath} replace />;
    }

    return <Outlet />;
};
