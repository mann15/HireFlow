import api from "../api/axios";

const BASE = "/positions";

export const assignReviewer = async (positionId, reviewerId) => {
  const response = await api.put(
    `${BASE}/${positionId}/assign-reviewer`,
    null,
    {
      params: { reviewerId },
    }
  );
  return response.data;
};

export const addComment = async (positionId, commentData) => {
  const response = await api.post(
    `${BASE}/${positionId}/comments`,
    commentData
  );
  return response.data;
};

export const shortlistCandidate = async (positionId, candidateId) => {
  const response = await api.put(`${BASE}/${positionId}/shortlist`, null, {
    params: { candidateId },
  });
  return response.data;
};

export const getNotifications = async (positionId) => {
  const response = await api.get(`${BASE}/${positionId}/notifications`);
  return response.data;
};
