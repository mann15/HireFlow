import api from "./axios";

export const loginApi = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  // Token is stored in httpOnly cookie by backend
  return response.data;
};

export const signupApi = async (userData) => {
  const response = await api.post("/auth/register", userData);
  // Token is stored in httpOnly cookie by backend
  return response.data;
};

export const verifyTokenApi = async () => {
  // Backend uses cookie-based auth, so we just call /me endpoint
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};
