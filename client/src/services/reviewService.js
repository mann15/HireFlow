import api from "../api/axios";

const BASE = "/positions";
const REVIEWER_BASE = "/position-reviewers";

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
  return response.data;
};

// Add comment to application
export const addComment = async (positionId, commentData) => {
  const response = await api.post(
    `${BASE}/${positionId}/comments`,
    commentData
  );
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
  const response = await api.post("/api/screening-feedback", feedbackData);
  return response.data;
};

// Get screening feedback for application
export const getScreeningFeedback = async (applicationId) => {
  const response = await api.get(
    `/api/applications/${applicationId}/screening-feedback`
  );
  return response.data;
};

// Check candidate history (previous screening/interview)
export const checkCandidateHistory = async (
  candidateId,
  currentApplicationId
) => {
  const response = await api.get(
    `/api/candidates/${candidateId}/history-check`,
    {
      params: { currentApplicationId },
    }
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
    `/api/candidates/${candidateId}/skills/${skillId}/verify`,
    verificationData
  );
  return response.data;
};
