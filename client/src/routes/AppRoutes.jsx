import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth Pages
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import CandidateLogin from "../pages/CandidateLogin";
import CandidatePasswordReset from "../pages/CandidatePasswordReset";

// Dashboards
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import RecruiterDashboard from "../pages/dashboards/RecruiterDashboard";
import HRDashboard from "../pages/dashboards/HRDashboard";
import InterviewerDashboard from "../pages/dashboards/InterviewerDashboard";
import ReviewerDashboard from "../pages/dashboards/ReviewerDashboard";
import ViewerDashboard from "../pages/dashboards/ViewerDashboard";
import CandidateDashboard from "../pages/dashboards/CandidateDashboard";

// Position Pages
import PositionsList from "../pages/positions/PositionsList";
import PositionDetails from "../pages/positions/PositionDetails";
import AddPosition from "../pages/positions/AddPosition";
import EditPosition from "../pages/positions/EditPosition";
import PositionApplications from "../pages/positions/PositionApplications";
import PositionAnalytics from "../pages/positions/PositionAnalytics";

// Candidate Pages
import CandidatesList from "../pages/candidates/CandidatesList";
import CandidateDetails from "../pages/candidates/CandidateDetails";
import AddCandidate from "../pages/candidates/AddCandidate";

// Application Pages
import ApplicationsListPage from "../pages/applications/ApplicationsListPage";
import ApplicationDetailsPage from "../pages/applications/ApplicationDetailsPage";

// Interview Pages
import InterviewsList from "../components/interviews/InterviewsList";
import InterviewManagement from "../pages/interviews/InterviewManagement";
import MyInterviewsPage from "../pages/interviews/MyInterviewsPage";

// Documents Pages
import DocumentsList from "../components/documents/DocumentsList";
import DocumentVerificationPage from "../pages/documents/DocumentVerificationPage";
import DocumentUploadPage from "../pages/documents/DocumentUploadPage";
import DocumentTypesManagement from "../pages/documents/DocumentTypesManagement";
import ReviewScreening from "../pages/review/ReviewScreening";

// Offers Pages
import OffersList from "../components/offers/OffersList";
import OffersPage from "../pages/offers/OffersPage";

// Reports Pages
import ReportsDashboard from "../pages/reports/ReportsDashboard";
import ReportsPage from "../pages/reports/ReportsPage";

// Notifications
import NotificationsPage from "../pages/notifications/NotificationsPage";

// Admin Pages
import UserManagement from "../pages/admin/UserManagement";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/candidate/login" element={<CandidateLogin />} />
      <Route
        path="/candidate/reset-password"
        element={<CandidatePasswordReset />}
      />

      {/* Dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={["RECRUITER", "ADMIN", "SUPER_ADMIN"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedRoles={["HR", "ADMIN", "SUPER_ADMIN"]}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviewer/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["INTERVIEWER", "ADMIN", "SUPER_ADMIN"]}
          >
            <InterviewerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviewer/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["REVIEWER", "ADMIN", "SUPER_ADMIN", "HR"]}
          >
            <ReviewerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/viewer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["VIEWER", "ADMIN", "SUPER_ADMIN"]}>
            <ViewerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CANDIDATE", "ADMIN", "SUPER_ADMIN"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />

      {/* Positions */}
      <Route
        path="/positions"
        element={
          <ProtectedRoute>
            <PositionsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions/new"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITER"]}>
            <AddPosition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions/add"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITER"]}>
            <AddPosition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions/:id"
        element={
          <ProtectedRoute
            allowedRoles={[
              "ADMIN",
              "SUPER_ADMIN",
              "RECRUITER",
              "HR",
              "REVIEWER",
              "INTERVIEWER",
              "CANDIDATE",
              "VIEWER",
            ]}
          >
            <PositionDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/positions/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITER"]}>
            <EditPosition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions/:id/applications"
        element={
          <ProtectedRoute
            allowedRoles={[
              "ADMIN",
              "SUPER_ADMIN",
              "RECRUITER",
              "HR",
              "REVIEWER",
              "VIEWER",
            ]}
          >
            <PositionApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions/:id/analytics"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITER", "HR", "VIEWER"]}
          >
            <PositionAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions/:id/applications/:applicationId/review"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "SUPER_ADMIN", "HR", "REVIEWER"]}
          >
            <ReviewScreening />
          </ProtectedRoute>
        }
      />

      {/* Candidates */}
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <CandidatesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates/new"
        element={
          <ProtectedRoute>
            <AddCandidate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates/add"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITER", "HR"]}
          >
            <AddCandidate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates/:candidateId"
        element={
          <ProtectedRoute>
            <CandidateDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates/:candidateId/edit"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITER", "HR"]}
          >
            <AddCandidate />
          </ProtectedRoute>
        }
      />

      {/* Applications */}
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <ApplicationsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:applicationId"
        element={
          <ProtectedRoute>
            <ApplicationDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:applicationId/documents"
        element={
          <ProtectedRoute
            allowedRoles={[
              "CANDIDATE",
              "HR",
              "RECRUITER",
              "ADMIN",
              "SUPER_ADMIN",
            ]}
          >
            <DocumentUploadPage />
          </ProtectedRoute>
        }
      />

      {/* Interviews */}
      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <InterviewsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews/manage"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "SUPER_ADMIN", "HR", "RECRUITER"]}
          >
            <InterviewManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews/my"
        element={
          <ProtectedRoute
            allowedRoles={[
              "INTERVIEWER",
              "ADMIN",
              "SUPER_ADMIN",
              "HR",
              "REVIEWER",
            ]}
          >
            <MyInterviewsPage />
          </ProtectedRoute>
        }
      />

      {/* Documents */}
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents/verify"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "HR"]}>
            <DocumentVerificationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents/types/manage"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "HR"]}>
            <DocumentTypesManagement />
          </ProtectedRoute>
        }
      />

      {/* Offers */}
      <Route
        path="/offers"
        element={
          <ProtectedRoute>
            <OffersList />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsDashboard />
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
