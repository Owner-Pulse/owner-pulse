import { useGetUser } from '@/hooks';
import React from 'react';
import { Navigate, Outlet } from 'react-router';

export const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isLoading } = useGetUser();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1E3A5F]">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const basePath = user.role === 'owner' ? '/owner' : '/director';

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={basePath} replace />;
    }

    return <Outlet />;
};
