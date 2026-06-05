import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "../layouts/auth-layout";
import LoginPage from "../pages/auth-pages/login/login-page";
import ForgetPasswordPage from "../pages/auth-pages/forget-password/forget-password-page";
import RestPasswordPage from "../pages/auth-pages/reset-password/reset-password-page";
import DashboardLayout from "../layouts/dashboard-layout";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import OwnerRoute from "../routes/OwnerRoute";
import DirectorRoute from "../routes/DirectorRoute";
import HCLCDashboard from "../App";
import OverviewPage from "@/pages/dashboard/overview-page/overview-page";

// Redirect directors to /dashboard/director-overview on index, show OverviewPage for owners
const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user") || '{"role":"owner"}');
  if (user.role === "director") {
    return <Navigate to="/dashboard/director-overview" replace />;
  }
  return <OverviewPage />;
};

import EnrollmentPage from "@/pages/dashboard/enrollments/enrollment-page";
import ClassroomsPage from "@/pages/dashboard/classrooms/classrooms-page";
import CashFlowPage from "@/pages/dashboard/cash-flow/cashflow-page";
import CompliancePage from "@/pages/dashboard/compliance/compliance-page";
import TasksPage from "@/pages/dashboard/tasks/tasks-page";
import MaintenancePage from "@/pages/dashboard/maintainance/maintenance-page";
import BudgetPage from "@/pages/dashboard/budget/budget-page";
import ProfilePage from "@/pages/dashboard/profile/profile-page";
import SettingsPage from "@/pages/dashboard/settings/settings-page";
import ScholarshipsPage from "@/pages/dashboard/scholarships/scholarships-page";
import StaffPage from "@/pages/dashboard/staff/staff-page";
import WaitlistPage from "@/pages/dashboard/waitlist/waitlist-page";
import DirectorManagementPage from "@/pages/dashboard/director-management/director-management-page";
import PayrollPage from "@/pages/dashboard/payroll/payroll-page";
import DirectorStaffPage from "@/pages/dashboard/director-staff/director-staff-page";
import DirectorStudentsPage from "@/pages/dashboard/director-students/director-students-page";
import DirectorOverviewPage from "@/pages/dashboard/director-overview/director-overview-page";
import ComingSoon from "@/components/ComingSoon";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
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
          // Index: redirect based on role
          {
            index: true,
            element: <DashboardRedirect />
          },

          // ─── Owner-Only Routes ───
          {
            element: <OwnerRoute />,
            children: [
              {
                path: 'enrollment',
                element: <EnrollmentPage />
              },
              {
                path: 'classrooms',
                element: <ClassroomsPage />
              },
              {
                path: 'cashflow',
                element: <CashFlowPage />
              },
              {
                path: 'compliance',
                element: <CompliancePage />
              },
              {
                path: 'scholarships',
                element: <ScholarshipsPage />
              },
              {
                path: 'staff',
                element: <StaffPage />
              },
              {
                path: 'director-management',
                element: <DirectorManagementPage />
              },
            ]
          },

          // ─── Director-Only Routes ───
          {
            element: <DirectorRoute />,
            children: [
              {
                path: 'director-overview',
                element: <ComingSoon/>
              },
              {
                path: 'director-staff',
                element: <ComingSoon/>
              },
              {
                path: 'director-students',
                element: <ComingSoon/>
              },
              {
                path: 'payroll',
                element: <ComingSoon/>
              },
            ]
          },

          // ─── Shared Routes (accessible by both roles) ───
          {
            path: 'tasks',
            element: <TasksPage />
          },
          {
            path: 'maintenance',
            element: <MaintenancePage />
          },
          {
            path: 'budget',
            element: <BudgetPage />
          },
          {
            path: 'waitlist',
            element: <WaitlistPage />
          },
          {
            path: 'profile',
            element: <ProfilePage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          },
        ]
      }
    ]
  }
]);
