import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./services/authService";
import Loader from "./components/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const dispatch = useDispatch();
  const { globalLoading, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-hidden pt-16">
          {isAuthenticated && <Sidebar />}
          <main className="flex-1 overflow-y-auto w-full relative">
            <div className="h-full">
              {globalLoading && <Loader />}
              <AppRoutes />
            </div>
          </main>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          pauseOnFocusLoss={false}
        />
      </div>
    </Router>
  );
};

export default App;
