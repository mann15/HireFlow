import api from "../api/axios";

const BASE = "/offers";

// Generate offer
export const generateOffer = async (offerData) => {
  const response = await api.post(`${BASE}/generate`, offerData);
  return response.data;
};

// Get offer by ID
export const getOfferById = async (offerId) => {
  const response = await api.get(`${BASE}/${offerId}`);
  return response.data;
};

// Get offers by application
export const getOffersByApplication = async (applicationId) => {
  // Validate applicationId
  if (
    !applicationId ||
    applicationId === "undefined" ||
    applicationId === "null"
  ) {
    throw new Error("Invalid application ID");
  }
  const response = await api.get(`${BASE}/application/${applicationId}`);
  return response.data;
};

// Get offers by status
export const getOffersByStatus = async (status) => {
  const response = await api.get(`${BASE}/status/${status}`);
  return response.data;
};

// Send offer to candidate
export const sendOffer = async (offerId) => {
  const response = await api.put(`${BASE}/${offerId}/send`);
  return response.data;
};

// Accept offer
export const acceptOffer = async (offerId) => {
  const response = await api.put(`${BASE}/${offerId}/accept`);
  return response.data;
};

// Reject offer
export const rejectOffer = async (offerId, reason) => {
  const response = await api.put(`${BASE}/${offerId}/reject`, null, {
    params: { reason },
  });
  return response.data;
};

// Withdraw offer
export const withdrawOffer = async (offerId) => {
  const response = await api.put(`${BASE}/${offerId}/withdraw`);
  return response.data;
};

// Get offers for the logged-in candidate
export const getMyOffers = async () => {
  const response = await api.get(`${BASE}/my`);
  return response.data;
};
