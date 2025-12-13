import api from "../api/axios";

const BASE = "/interviews";

// Define interview rounds for a position or optionally for a specific candidate override
export const defineInterviewRounds = async (
  positionId,
  roundsData,
  candidateId
) => {
  const response = await api.post(`${BASE}/rounds/define`, roundsData, {
    params: { positionId, candidateId },
  });
  return response.data;
};

// Get interview rounds for a position
export const getInterviewRounds = async (positionId) => {
  const response = await api.get(`${BASE}/rounds/position/${positionId}`);
  return response.data;
};

// Schedule single interview
export const scheduleInterview = async (scheduleData) => {
  const response = await api.post(`${BASE}/schedule`, scheduleData);
  return response.data;
};

// Schedule bulk interviews
export const scheduleBulkInterviews = async (bulkData) => {
  const response = await api.post(`${BASE}/bulk-schedule`, bulkData);
  return response.data;
};

// Reschedule interview
export const rescheduleInterview = async (interviewId, newDate) => {
  const response = await api.put(`${BASE}/${interviewId}/reschedule`, null, {
    params: { newDate },
  });
  return response.data;
};

// Cancel interview
export const cancelInterview = async (interviewId) => {
  const response = await api.put(`${BASE}/${interviewId}/cancel`);
  return response.data;
};

// Submit interview feedback
export const submitFeedback = async (interviewId, feedbackData) => {
  const response = await api.post(
    `${BASE}/${interviewId}/feedback`,
    feedbackData
  );
  return response.data;
};

// Get interviews by application
export const getInterviewsByApplication = async (applicationId) => {
  const response = await api.get(`${BASE}/application/${applicationId}`);
  return response.data;
};

// Get interviews for current user (as panelist)
export const getMyInterviews = async () => {
  const response = await api.get(`${BASE}/my-interviews`);
  return response.data;
};

// Get interview by ID
export const getInterviewById = async (interviewId) => {
  const response = await api.get(`${BASE}/${interviewId}`);
  return response.data;
};

// Simulate online interview (legacy - keep for backwards compatibility)
export const simulateOnlineInterview = async (candidateId) => {
  const response = await api.post(`${BASE}/simulate-online`, null, {
    params: { candidateId },
  });
  return response.data;
};
