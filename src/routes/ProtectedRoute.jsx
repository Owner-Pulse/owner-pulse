import { useGetUser } from '@/hooks';
import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { motion } from 'framer-motion';
import logo from '@/assets/Logo.png';

export const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isLoading } = useGetUser();

    if (isLoading) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center p-4 bg-[#1E3A5F]"
                style={{ background: 'rgb(10, 15, 30)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center gap-10"
                >
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0],
                        }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="relative"
                    >
                        {/* Subtle glow effect behind the logo */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150" />
                        <img
                            src={logo}
                            alt="OwnerPulse Logo"
                            className="h-28 w-auto drop-shadow-2xl relative z-10"
                        />
                    </motion.div>
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            <motion.div 
                                className="w-2.5 h-2.5 bg-blue-600 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                                className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                            />
                            <motion.div 
                                className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                            />
                        </div>
                        <motion.p 
                            className="text-white/60 text-sm font-medium tracking-[0.2em] uppercase mt-2"
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            Loading workspace
                        </motion.p>
                    </div>
                </motion.div>
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
