import {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout as logoutAction,
  setGlobalLoading,
} from "../redux/userSlice";
import { loginApi, signupApi,verifyTokenApi } from "../api/authApi";

// Login service
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    // Show global loader
    dispatch(setGlobalLoading(true));

    const data = await loginApi(credentials);

    // Save token to localStorage
    localStorage.setItem("token", data.token);

    dispatch(loginSuccess(data.user));
    return { success: true };
  } catch (error) {
    const message =
      error.response?.data?.message || "Login failed. Please try again.";
    dispatch(loginFailure(message));
    return { success: false, message };
  } finally {
    // Hide global loader
    dispatch(setGlobalLoading(false));
  }
};

// Signup service
export const signup = (userData) => async (dispatch) => {
  try {
    dispatch(signupStart());
    // Show global loader
    dispatch(setGlobalLoading(true));

    const data = await signupApi(userData);

    // Save token to localStorage
    localStorage.setItem("token", data.token);

    dispatch(signupSuccess(data.user));
    return { success: true };
  } catch (error) {
    const message =
      error.response?.data?.message || "Signup failed. Please try again.";
    dispatch(signupFailure(message));
    return { success: false, message };
  } finally {
    // Hide global loader
    dispatch(setGlobalLoading(false));
  }
};

// Verify token and auto-login
export const checkAuth = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    dispatch(loginStart());
    dispatch(setGlobalLoading(true));
    const data = await verifyTokenApi();
    dispatch(loginSuccess(data.user));
  } catch (error) {
    localStorage.removeItem("token");
    dispatch(loginFailure(null));
  } finally {
    dispatch(setGlobalLoading(false));
  }
};

// Logout service
export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  dispatch(logoutAction());
};
