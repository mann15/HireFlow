import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { login } from "../services/authService";
import { clearError } from "../redux/userSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    // If user is already authenticated, redirect to home page
    if (isAuthenticated) {
      navigate("/");
    }

    // Set error message from Redux state
    if (error) {
      setErrorMessage(error);
    }

    // Clear error on component unmount
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, error, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const result = await dispatch(login(formData));

    if (result.success) {
      navigate("/");
    }
  };

  const handleGoogleLogin = () => {
    // Google login would typically be handled by the backend
    console.log("Login with Google - Not implemented yet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[var(--secondary-color)]">
            Sign in to your account
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 z-40" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 z-40" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-md bg-red-50 p-3">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {errorMessage}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--primary-color)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Sign in with Google
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-[var(--primary-color)] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
