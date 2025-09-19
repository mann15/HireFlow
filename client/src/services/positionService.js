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

// The server doesn't expose a dedicated applications controller in source; try common endpoints
// and fall back gracefully to returning an empty array if none exist.
export const getApplicationsByPosition = async (positionId) => {
  try {
    // try nested position endpoint first
    const res = await api.get(`${BASE}/${positionId}/applications`);
    return res.data;
  } catch (err) {
    // fallback: try a generic applications endpoint with query param
    try {
      const res2 = await api.get(`/api/applications`, {
        params: { positionId },
      });
      return res2.data;
    } catch (err2) {
      // Not available on backend — return empty array and let the UI handle it
      return [];
    }
  }
};
