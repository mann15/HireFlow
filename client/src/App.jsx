import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
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
            <Route path="/positions/add" element={<AddPosition />} />
            <Route path="/positions/:id" element={<PositionDetails />} />
            <Route path="/positions/:id/edit" element={<EditPosition />} />
            <Route
              path="/positions/:id/applications"
              element={<PositionApplications />}
            />
            <Route
              path="/positions/:id/analytics"
              element={<PositionAnalytics />}
            />
            <Route path="/positions/:id/review" element={<ReviewScreening />} />

            {/* Candidate Routes */}
            <Route path="/candidates" element={<CandidatesList />} />
            <Route path="/candidates/add" element={<AddCandidate />} />
            <Route
              path="/candidates/:candidateId"
              element={<CandidateDetails />}
            />
            <Route
              path="/candidates/:candidateId/edit"
              element={<AddCandidate />}
            />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/recruiter/dashboard"
              element={<RecruiterDashboard />}
            />
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route
              path="/interviewer/dashboard"
              element={<InterviewerDashboard />}
            />
            <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} />
            <Route path="/viewer/dashboard" element={<ViewerDashboard />} />
            <Route
              path="/interviews/manage"
              element={<InterviewManagement />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
