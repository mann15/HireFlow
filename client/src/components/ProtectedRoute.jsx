import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "./Loader";

const normalizeRole = (role) => {
  const rawRole =
    typeof role === "object" ? role?.roleName || role?.name : role;
  return rawRole
    ? String(rawRole)
        .replace(/^ROLE_/, "")
        .toUpperCase()
    : rawRole;
};

// Helper function to get dashboard path based on user role
const getDashboardPathByRole = (role) => {
  const roleUpper = normalizeRole(role);

  switch (roleUpper) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "RECRUITER":
      return "/recruiter/dashboard";
    case "HR":
      return "/hr/dashboard";
    case "INTERVIEWER":
      return "/interviewer/dashboard";
    case "REVIEWER":
      return "/reviewer/dashboard";
    case "VIEWER":
      return "/viewer/dashboard";
    case "CANDIDATE":
      return "/candidate/dashboard";
    default:
      return "/login";
  }
};

// Basic route guard that checks authentication and optional role allowlist.
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const { isAuthenticated, currentUser, globalLoading, authCheckComplete } =
    useSelector((state) => state.user);

  // While auth check is in progress, show loader instead of redirecting
  if (!authCheckComplete) {
    return <Loader />;
  }

  if (globalLoading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const userRole = normalizeRole(currentUser?.role || currentUser?.roleName);

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const dashboardPath = getDashboardPathByRole(userRole);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
