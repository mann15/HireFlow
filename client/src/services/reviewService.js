import api from "../api/axios";

const BASE = "/positions";
const REVIEWER_BASE = "/position-reviewers";

const SCREENING_BASE = "/screening";

// Assign reviewer to position
export const assignReviewer = async (positionId, reviewerId) => {
  const response = await api.post(REVIEWER_BASE, {
    positionId: positionId,
    reviewerId: reviewerId,
  });
  return response.data;
};

// Get reviewers assigned to a position
export const getPositionReviewers = async (positionId) => {
  const response = await api.get(`${REVIEWER_BASE}/position/${positionId}`);
  return response.data;
};

// Remove reviewer from position
export const removeReviewer = async (positionId, reviewerId) => {
  const response = await api.delete(
    `${REVIEWER_BASE}/${positionId}/${reviewerId}`
  );
  return response.status >= 200 && response.status < 300;
};

// Add comment to application
export const addScreeningComment = async (commentData) => {
  const response = await api.post(`${SCREENING_BASE}/comments`, commentData);
  return response.data;
};

// Shortlist candidate
export const shortlistCandidate = async (positionId, candidateId) => {
  const response = await api.put(`${BASE}/${positionId}/shortlist`, null, {
    params: { candidateId },
  });
  return response.data;
};

// Get notifications for position
export const getNotifications = async (positionId) => {
  const response = await api.get(`${BASE}/${positionId}/notifications`);
  return response.data;
};

// Submit screening feedback
export const submitScreeningFeedback = async (feedbackData) => {
  const response = await api.post(`${SCREENING_BASE}/feedback`, feedbackData);
  return response.data;
};

// Get screening feedback for application
export const getScreeningFeedback = async (applicationId) => {
  const response = await api.get(
    `${SCREENING_BASE}/feedback/application/${applicationId}`
  );
  return response.data;
};

// Screening comments for application
export const getScreeningComments = async (applicationId) => {
  const response = await api.get(
    `${SCREENING_BASE}/comments/application/${applicationId}`
  );
  return response.data;
};

// Screening notifications for application (previous screenings/interviews)
export const getScreeningNotifications = async (applicationId) => {
  const response = await api.get(
    `${SCREENING_BASE}/notifications/application/${applicationId}`
  );
  return response.data;
};

// Trigger history check (previous screening/interview) for an application
export const checkCandidateHistory = async (applicationId) => {
  const response = await api.post(
    `${SCREENING_BASE}/application/${applicationId}/check-history`
  );
  return response.data;
};

// Verify candidate skill
export const verifyCandidateSkill = async (
  candidateId,
  skillId,
  verificationData
) => {
  const response = await api.put(
    `/candidates/${candidateId}/skills/${skillId}/verify`,
    verificationData
  );
  return response.data;
};
