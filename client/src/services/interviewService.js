import api from "../api/axios";

const BASE = "/interviews";

export const defineInterviewRounds = async (roundsData) => {
  const response = await api.post(`${BASE}/define-rounds`, roundsData);
  return response.data;
};

export const scheduleInterview = async (scheduleData) => {
  const response = await api.post(`${BASE}/schedule`, scheduleData);
  return response.data;
};

export const simulateOnlineInterview = async (candidateId) => {
  const response = await api.post(`${BASE}/simulate-online`, null, {
    params: { candidateId },
  });
  return response.data;
};

export const scheduleBulkInterviews = async (bulkData) => {
  const response = await api.post(`${BASE}/bulk-schedule`, bulkData);
  return response.data;
};
