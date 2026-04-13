import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import logo from "/logo.png";
import { logout } from "../services/authService";
import NotificationBell from "./notifications/NotificationBell";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser, isAuthenticated } = useSelector((state) => state.user);

  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (currentUser?.name) {
      const formattedName =
        currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1);
      setUserName(formattedName);
    } else if (currentUser?.firstName) {
      setUserName(
        `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
      );
    } else if (currentUser?.email) {
      setUserName(currentUser.email.split("@")[0]);
    } else {
      setUserName("User");
    }
  }, [currentUser]);

  // Get role-based navigation items
  const getNavigationItems = () => {
    if (!isAuthenticated || !currentUser) return [];

    const role = currentUser.role?.toUpperCase();

    switch (role) {
      case "ADMIN":
      case "SUPER_ADMIN":
        return [
          { name: "Dashboard", path: "/admin/dashboard" },
          { name: "Positions", path: "/positions" },
          { name: "Candidates", path: "/candidates" },
          { name: "Users", path: "/admin/users" },
          { name: "Reports", path: "/reports" },
        ];

      case "RECRUITER":
        return [
          { name: "Dashboard", path: "/recruiter/dashboard" },
          { name: "Positions", path: "/positions" },
          { name: "Candidates", path: "/candidates" },
          { name: "Applications", path: "/applications" },
        ];

      case "HR":
        return [
          { name: "Dashboard", path: "/hr/dashboard" },
          { name: "Positions", path: "/positions" },
          { name: "Candidates", path: "/candidates" },
          { name: "Interviews", path: "/interviews/manage" },
          { name: "Documents", path: "/documents/verify" },
          { name: "Offers", path: "/offers" },
          { name: "Reports", path: "/reports" },
        ];

      case "INTERVIEWER":
        return [
          { name: "Dashboard", path: "/interviewer/dashboard" },
          { name: "Interviews", path: "/interviews/my" },
        ];

      case "REVIEWER":
        return [
          { name: "Dashboard", path: "/reviewer/dashboard" },
          { name: "Applications", path: "/applications" },
        ];

      case "VIEWER":
        return [
          { name: "Dashboard", path: "/viewer/dashboard" },
          { name: "Positions", path: "/positions" },
          { name: "Candidates", path: "/candidates" },
        ];

      case "CANDIDATE":
        return [
          { name: "Dashboard", path: "/candidate/dashboard" },
          { name: "Positions", path: "/positions" },
        ];

      default:
        return [
          { name: "Positions", path: "/positions" },
          { name: "Candidates", path: "/candidates" },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 shadow-sm h-16 z-50">
      <div className="flex justify-between items-center h-full px-4 lg:px-6">
        <div className=" overflow-hidden">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="HireFlow Logo"
              className="h-32 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="hidden md:flex items-center mr-4">
                <span className="font-medium text-gray-700">Hi, {userName}</span>
                {currentUser?.role && (
                  <span
                    className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                  >
                    {currentUser.role}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  dispatch(logout());
                  navigate("/login");
                }}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition duration-200 font-medium border border-transparent hover:border-red-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {location.pathname !== "/login" && location.pathname !== "/candidate/login" && (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm rounded-lg text-blue-600 hover:bg-blue-50 transition font-medium"
                >
                  Login
                </Link>
              )}

              {location.pathname !== "/signup" && (
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition font-medium"
                >
                  Sign Up
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
