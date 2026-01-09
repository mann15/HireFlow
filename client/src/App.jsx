import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./services/authService";
import Loader from "./components/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const dispatch = useDispatch();
  const { globalLoading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          {globalLoading && <Loader />}
          <AppRoutes />
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
