import api from "./axios";

export const loginApi = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const signupApi = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const verifyTokenApi = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
