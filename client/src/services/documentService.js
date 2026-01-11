import api from "../api/axios";

const BASE = "/documents";

// Upload document
export const uploadDocument = async (formData) => {
  const response = await api.post(`${BASE}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Fetch available document types from backend
export const getDocumentTypes = async () => {
  const response = await api.get(`${BASE}/types`);
  return response.data;
};

// Get documents by application
export const getDocumentsByApplication = async (applicationId) => {
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

// Get documents by candidate
export const getDocumentsByCandidate = async (candidateId) => {
  const response = await api.get(`${BASE}/candidate/${candidateId}`);
  return response.data;
};

// Get pending documents
export const getPendingDocuments = async () => {
  const response = await api.get(`${BASE}/pending`);
  return response.data;
};

// Verify document
export const verifyDocument = async (documentId, status, remarks) => {
  const response = await api.put(`${BASE}/${documentId}/verify`, {
    status,
    remarks,
  });
  return response.data;
};

// Get document by ID
export const getDocumentById = async (documentId) => {
  const response = await api.get(`${BASE}/${documentId}`);
  return response.data;
};

// Delete document
export const deleteDocument = async (documentId) => {
  const response = await api.delete(`${BASE}/${documentId}`);
  return response.data;
};
