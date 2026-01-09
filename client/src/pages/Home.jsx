import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const role = currentUser.role?.toUpperCase();
      switch (role) {
        case "ADMIN":
        case "SUPER_ADMIN":
          navigate("/admin/dashboard");
          break;
        case "RECRUITER":
          navigate("/recruiter/dashboard");
          break;
        case "HR":
          navigate("/hr/dashboard");
          break;
        case "INTERVIEWER":
          navigate("/interviewer/dashboard");
          break;
        case "REVIEWER":
          navigate("/reviewer/dashboard");
          break;
        case "VIEWER":
          navigate("/viewer/dashboard");
          break;
        default:
          navigate("/positions");
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-50 p-8 mt-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--secondary-color)] mb-4">
          Welcome to <span className="text-[var(--primary-color)]">HireFlow</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Streamline your recruitment process with our comprehensive management system
        </p>
        {!isAuthenticated && (
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 border-2 border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
