import api from "../api/axios";

const BASE = "/applications";

// Helper function to validate applicationId
const validateApplicationId = (applicationId) => {
  if (!applicationId || applicationId === "undefined" || applicationId === "null") {
    throw new Error("Invalid application ID");
  }
};

// Get all applications
export const getAllApplications = async () => {
  const response = await api.get(`${BASE}`);
  return response.data;
};

// Get applications by position
export const getApplicationsByPosition = async (positionId) => {
  const response = await api.get(`${BASE}`, { params: { positionId } });
  return response.data;
};

// Get applications by candidate
export const getApplicationsByCandidate = async (candidateId) => {
  const response = await api.get(`${BASE}`, { params: { candidateId } });
  return response.data;
};

// Get application by ID
export const getApplicationById = async (applicationId, isCandidate = false) => {
  // Validate applicationId
  if (!applicationId || applicationId === "undefined" || applicationId === "null") {
    throw new Error("Invalid application ID");
  }

  if (isCandidate) {
    // Use candidate-specific endpoint
    const response = await api.get(`/candidates/me/applications/${applicationId}`);
    return response.data;
  }
  const response = await api.get(`${BASE}/${applicationId}`);
  return response.data;
};

// Create new application
export const createApplication = async (applicationData) => {
  const response = await api.post(`${BASE}`, applicationData);
  return response.data;
};

// Update application status
export const updateApplicationStatus = async (
  applicationId,
  status,
  remarks
) => {
  validateApplicationId(applicationId);
  const response = await api.put(`${BASE}/${applicationId}/status`, null, {
    params: { status, remarks },
  });
  return response.data;
};

// Move application to screening
export const moveToScreening = async (applicationId) => {
  validateApplicationId(applicationId);
  const response = await api.put(`${BASE}/${applicationId}/move-to-screening`);
  return response.data;
};

// Move application to interview
export const moveToInterview = async (applicationId) => {
  validateApplicationId(applicationId);
  const response = await api.put(`${BASE}/${applicationId}/move-to-interview`);
  return response.data;
};

// Put application on hold
export const moveToHold = async (applicationId, reason) => {
  validateApplicationId(applicationId);
  const response = await api.put(`${BASE}/${applicationId}/hold`, null, {
    params: { reason },
  });
  return response.data;
};

// Reject application
export const rejectApplication = async (applicationId, reason) => {
  validateApplicationId(applicationId);
  const response = await api.put(`${BASE}/${applicationId}/reject`, null, {
    params: { reason },
  });
  return response.data;
};

// Select candidate
export const selectCandidate = async (applicationId) => {
  validateApplicationId(applicationId);
  const response = await api.put(`${BASE}/${applicationId}/select`);
  return response.data;
};

// Update background verification status for an application
export const updateBackgroundVerification = async (
  applicationId,
  status,
  remarks
) => {
  validateApplicationId(applicationId);
  const response = await api.put(
    `${BASE}/${applicationId}/background-verification`,
    null,
    {
      params: { status, remarks },
    }
  );
  return response.data;
};

// Confirm joining date (post-offer acceptance)
export const confirmJoining = async (applicationId, joiningDate) => {
  validateApplicationId(applicationId);
  const response = await api.put(
    `${BASE}/${applicationId}/confirm-joining`,
    null,
    {
      params: { joiningDate },
    }
  );
  return response.data;
};

// Get application timeline/history
export const getApplicationTimeline = async (applicationId) => {
  // Validate applicationId
  if (!applicationId || applicationId === "undefined" || applicationId === "null") {
    throw new Error("Invalid application ID");
  }
  const response = await api.get(`${BASE}/${applicationId}/timeline`);
  return response.data;
};
