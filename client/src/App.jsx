import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PositionsList from "./pages/positions/PositionsList";
import AddPosition from "./pages/positions/AddPosition";
import PositionDetails from "./pages/positions/PositionDetails";
import EditPosition from "./pages/positions/EditPosition";
import PositionApplications from "./pages/positions/PositionApplications";
import PositionAnalytics from "./pages/positions/PositionAnalytics";

// Candidate Pages
import CandidatesList from "./pages/candidates/CandidatesList";
import AddCandidate from "./pages/candidates/AddCandidate";
import CandidateDetails from "./pages/candidates/CandidateDetails";
import ReviewScreening from "./pages/review/ReviewScreening";

import { checkAuth } from "./services/authService";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import RecruiterDashboard from "./pages/dashboards/RecruiterDashboard";
import HRDashboard from "./pages/dashboards/HRDashboard";
import InterviewerDashboard from "./pages/dashboards/InterviewerDashboard";
import ReviewerDashboard from "./pages/dashboards/ReviewerDashboard";
import ViewerDashboard from "./pages/dashboards/ViewerDashboard";
import Loader from "./components/Loader";
import InterviewManagement from "./pages/interviews/InterviewManagement";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const dispatch = useDispatch();
  const { globalLoading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          {globalLoading && <Loader />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/positions" element={<PositionsList />} />
            <Route
              path="/positions/add"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITER"]}
                >
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
                <ProtectedRoute
                  allowedRoles={["ADMIN", "SUPER_ADMIN", "RECRUITER"]}
                >
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
                  allowedRoles={[
                    "ADMIN",
                    "SUPER_ADMIN",
                    "RECRUITER",
                    "HR",
                    "VIEWER",
                  ]}
                >
                  <PositionAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/positions/:id/review"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "SUPER_ADMIN", "HR", "REVIEWER"]}
                >
                  <ReviewScreening />
                </ProtectedRoute>
              }
            />

            {/* Candidate Routes */}
            <Route
              path="/candidates"
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
                  <CandidatesList />
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
                <ProtectedRoute
                  allowedRoles={["RECRUITER", "ADMIN", "SUPER_ADMIN"]}
                >
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
                <ProtectedRoute
                  allowedRoles={["VIEWER", "ADMIN", "SUPER_ADMIN"]}
                >
                  <ViewerDashboard />
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
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
