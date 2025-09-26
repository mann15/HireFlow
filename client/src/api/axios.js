import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Using cookie-based authentication: the backend sets a httpOnly 'token' cookie on login.
// Axios will send cookies when `withCredentials: true` is set above, so we don't
// need to read the token from localStorage or add an Authorization header here.
// Keep the request interceptor placeholder in case future request preprocessing
// is needed.
api.interceptors.request.use((config) => config);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("API returned 401 Unauthorized — redirecting to login");
      // Redirect to login so user can authenticate (frontend handles storing cookie)
      try {
        // window.location.href = "/login";
      } catch (e) {
        // fallback: do nothing
      }
    }
    return Promise.reject(error);
  }
);

export default api;
