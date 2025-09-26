import api from "../api/axios";

const BASE = "/positions";

export const getPositions = async () => {
  const res = await api.get(`${BASE}`);
  return res.data;
};

export const createPosition = async (payload) => {
  const res = await api.post(`${BASE}`, payload);
  return res.data;
};

export const getPositionById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const updatePosition = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const getApplicationsByPosition = async (positionId) => {
  try {
    const res = await api.get(`${BASE}/${positionId}/applications`);
    return res.data;
  } catch (err) {
    try {
      const res2 = await api.get(`/api/applications`, {
        params: { positionId },
      });
      return res2.data;
    } catch (err2) {
      return [];
    }
  }
};

export const updatePositionStatus = async (id, status, reason) => {
  const res = await api.patch(`${BASE}/${id}/status`, { status, reason });
  return res.data;
};

export const closePosition = async (id, payload) => {
  const res = await api.post(`${BASE}/${id}/close`, payload);
  return res.data;
};

export const addPositionSkills = async (id, skills) => {
  const res = await api.post(`${BASE}/${id}/skills`, { skills });
  return res.data;
};

export const updatePositionSkills = async (id, skills) => {
  const res = await api.put(`${BASE}/${id}/skills`, { skills });
  return res.data;
};

export const getPositionSkills = async (id) => {
  const res = await api.get(`${BASE}/${id}/skills`);
  return res.data;
};
