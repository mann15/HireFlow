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
          { name: "Users", path: "/users" },
          { name: "Analytics", path: "/analytics" },
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
          { name: "Interviews", path: "/interviews" },
          { name: "Offers", path: "/offers" },
        ];

      case "INTERVIEWER":
        return [
          { name: "Dashboard", path: "/interviewer/dashboard" },
          { name: "Interviews", path: "/interviews" },
          { name: "Candidates", path: "/candidates" },
        ];

      case "REVIEWER":
        return [
          { name: "Dashboard", path: "/reviewer/dashboard" },
          { name: "Applications", path: "/applications" },
          { name: "Candidates", path: "/candidates" },
        ];

      case "VIEWER":
        return [
          { name: "Dashboard", path: "/viewer/dashboard" },
          { name: "Positions", path: "/positions" },
          { name: "Candidates", path: "/candidates" },
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
    <nav className="fixed top-0 w-screen bg-[var(--background-color-light)] text-[var(--secondary-color)] shadow-md h-20 overflow-hidden z-50">
      <div className="container mx-auto flex justify-between items-center h-full">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-2/5 overflow-hidden rounded-lg flex items-center justify-center">
            <img
              src={logo}
              alt="HireFlow Logo"
              className="object-cover object-center scale-110"
            />
          </div>
        </Link>

        {/* Navigation Items */}
        {isAuthenticated && navigationItems.length > 0 && (
          <div className="hidden md:flex space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  location.pathname === item.path
                    ? "bg-[var(--primary-color)] text-white"
                    : "text-[var(--secondary-color)] hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="flex items-center mr-4">
                <span className="font-medium">Hi, {userName}</span>
                {currentUser?.role && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {currentUser.role}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  dispatch(logout());
                  navigate("/login");
                }}
                className="px-4 py-2 rounded-lg bg-[var(--primary-color)] hover:bg-[var(--primary-color-dark)] transition duration-200 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-[var(--primary-color)] hover:bg-[var(--primary-color-dark)] transition duration-200 font-medium"
                >
                  Login
                </Link>
              )}

              {location.pathname !== "/signup" && (
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg border-2 bg-[var(--primary-color)] border-white/30 hover:bg-[var(--primary-color-dark)] transition duration-200 font-medium"
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
