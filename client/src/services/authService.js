import {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout as logoutAction,
  setGlobalLoading,
  setAuthCheckComplete,
} from "../redux/userSlice";
import { loginApi, signupApi, verifyTokenApi } from "../api/authApi";
import api from "../api/axios";

// Login service
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());

    dispatch(setGlobalLoading(true));

    const data = await loginApi(credentials);

    dispatch(loginSuccess(data));
    return { success: true };
  } catch (error) {
    const message =
      error.response?.data?.message || "Login failed. Please try again.";
    dispatch(loginFailure(message));
    return { success: false, message };
  } finally {
    dispatch(setGlobalLoading(false));
  }
};

// Signup service
export const signup = (userData) => async (dispatch) => {
  try {
    dispatch(signupStart());
    dispatch(setGlobalLoading(true));

    const data = await signupApi(userData);

    dispatch(signupSuccess(data));
    return { success: true };
  } catch (error) {
    const message =
      error.response?.data?.message || "Signup failed. Please try again.";
    dispatch(signupFailure(message));
    return { success: false, message };
  } finally {
    dispatch(setGlobalLoading(false));
  }
};

// Verify token and auto-login
export const checkAuth = () => async (dispatch) => {
  try {
    console.log("Checking auth...");
    dispatch(setGlobalLoading(true));
    const data = await verifyTokenApi();
    dispatch(loginSuccess(data));
  } catch (error) {
    dispatch(loginFailure(null));
  } finally {
    dispatch(setGlobalLoading(false));
    dispatch(setAuthCheckComplete(true));
  }
};

// Logout service
export const logout = () => async (dispatch) => {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    console.error("Logout failed:", e);
  }
  dispatch(logoutAction());
};
