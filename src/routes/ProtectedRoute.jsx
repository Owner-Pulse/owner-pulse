import React from 'react';
import { Navigate, Outlet } from 'react-router';

export const ProtectedRoute = ({ allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If not allowed, redirect to their default dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
