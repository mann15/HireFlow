import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import logo from "/logo.png";
import { logout } from "../services/authService";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state) => state.user);

  return (
    <nav className="fixed top-0 w-screen bg-[var(--background-color-light)] text-[var(--secondary-color)]  shadow-md h-20">
      <div className="container mx-auto flex justify-between items-center h-full">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-2/5 overflow-hidden rounded-lg flex items-center justify-center">
            <img
              src={logo}
              alt="HireFlow Logo"
              className=" object-cover object-center scale-110"
            />
          </div>
        </Link>

        <div className="flex space-x-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center mr-4">
                <span className="font-medium">
                  Hi, {currentUser?.name || "User"}
                </span>
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
