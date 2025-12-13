import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "./Loader";

// Basic route guard that checks authentication and optional role allowlist.
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const { isAuthenticated, currentUser, globalLoading } = useSelector(
    (state) => state.user
  );

  if (globalLoading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const userRole = currentUser?.role?.toUpperCase();

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
