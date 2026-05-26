import { createBrowserRouter } from "react-router";
import AuthLayout from "../layouts/auth-layout";
import LoginPage from "../pages/auth-pages/login/login-page";
import ForgetPasswordPage from "../pages/auth-pages/forget-password/forget-password-page";
import RestPasswordPage from "../pages/auth-pages/reset-password/reset-password-page";
import DashboardLayout from "../layouts/dashboard-layout";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import HCLCDashboard from "../App";
import OverviewPage from "@/pages/dashboard/overview-page/overview-page";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AuthLayout />,
        children:[
            {
                index: true,
                element: <LoginPage />
            },
            {
                path: '/forget-password',
                element: <ForgetPasswordPage />
            },
            {
                path: '/reset-password',
                element: <RestPasswordPage />
            }
        ]
    },
    {
        path: '/dashboard',
        element: <ProtectedRoute />,
        children: [
            {
                path: '',
                element: <DashboardLayout />,
                children: [
                    {
                        index: true,
                        element: <OverviewPage />
                    },
                    // {
                    //     path: ':tab',
                    //     element: <HCLCDashboard />
                    // }
                ]
            }
        ]
    }
])