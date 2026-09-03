import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "../layouts/auth-layout";
import LoginPage from "../pages/auth-pages/login/login-page";
import ForgetPasswordPage from "../pages/auth-pages/forget-password/forget-password-page";
import RestPasswordPage from "../pages/auth-pages/reset-password/reset-password-page";
import DashboardLayout from "../layouts/dashboard-layout";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import OwnerRoute from "../routes/OwnerRoute";
import DirectorRoute from "../routes/DirectorRoute";

// ─── Owner Pages ───
import OverviewPage from "@/pages/owner-dashboard/overview/overview-page";
import EnrollmentPage from "@/pages/owner-dashboard/enrollment/enrollment-page";
import ClassroomsPage from "@/pages/owner-dashboard/classrooms/classrooms-page";
import OwnerClassroomDetailPage from "@/pages/owner-dashboard/classrooms/classroom-details/page";
import CashFlowPage from "@/pages/owner-dashboard/cash-flow/cashflow-page";
import CompliancePage from "@/pages/owner-dashboard/compliance/compliance-page";
import ScholarshipsPage from "@/pages/owner-dashboard/scholarships/scholarships-page";
import StaffPage from "@/pages/owner-dashboard/staff/staff-page";
import DirectorManagementPage from "@/pages/owner-dashboard/director-management/director-management-page";
import OwnerPayrollPage from "@/pages/owner-dashboard/payroll/payroll-page";

// ─── Director Pages ───
import DirectorOverviewPage from "@/pages/director-dashboard/overview/director-overview-page";
import DirectorStaffPage from "@/pages/director-dashboard/staff/director-staff-page";
import DirectorStudentsPage from "@/pages/director-dashboard/students/director-students-page";
import DirectorClassroomDetailPage from "@/pages/director-dashboard/students/student-details/page";
import DailyLogPage from "@/pages/director-dashboard/daily-log/daily-log-page";
import PayrollPage from "@/pages/director-dashboard/payroll/payroll-page";
import DirectorCompliancePage from "@/pages/director-dashboard/compliance/director-compliance-page";

// ─── Shared Pages ───
import NotFoundPage from "@/pages/not-found/not-found-page";
import TasksPage from "@/pages/shared/tasks/tasks-page";
import MaintenancePage from "@/pages/shared/maintenance/maintenance-page";
import BudgetPage from "@/pages/shared/budget/budget-page";
import WaitlistPage from "@/pages/shared/waitlist/waitlist-page";
import PtoPage from "@/pages/shared/pto/pto-page";
import ProfilePage from "@/pages/shared/profile/profile-page";
import SettingsPage from "@/pages/shared/settings/settings-page";
import BillingPage from "@/pages/shared/billing/billing-page";


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
    path: '/owner',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/owner/overview" replace />
          },
          {
            element: <OwnerRoute />,
            children: [
              {
                path: 'overview',
                element: <OverviewPage />
              },
              {
                path: 'enrollment',
                element: <EnrollmentPage />
              },
              {
                path: 'classrooms',
                element: <ClassroomsPage />
              },
              {
                path: 'classrooms/:id',
                element: <OwnerClassroomDetailPage />
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
              {
                path: 'billing',
                element: <BillingPage />
              },
              {
                path: 'payroll',
                element: <OwnerPayrollPage />
              },
            ]
          },
          // Shared pages under owner
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
            path: 'pto',
            element: <PtoPage />
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
  },
  {
    path: '/director',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/director/overview" replace />
          },
          {
            element: <DirectorRoute />,
            children: [
              {
                path: 'overview',
                element: <DirectorOverviewPage />
              },
              {
                path: 'staff',
                element: <DirectorStaffPage />
              },
              {
                path: 'students',
                element: <DirectorStudentsPage />
              },
              {
                path: 'students/:id',
                element: <DirectorClassroomDetailPage />
              },
              {
                path: 'daily-log',
                element: <DailyLogPage />
              },
              {
                path: 'payroll',
                element: <PayrollPage />
              },
              {
                path: 'compliance',
                element: <DirectorCompliancePage />
              },
            ]
          },
          // Shared pages under director
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
            path: 'pto',
            element: <PtoPage />
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
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
