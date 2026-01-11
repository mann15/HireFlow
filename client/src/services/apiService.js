import api from "../api/axios";

const API_BASE = "/";

export const positionService = {
  // Get all positions with filters
  getPositions: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/positions?${params}`);
    return response.data;
  },

  // Get single position with details
  getPositionById: async (positionId) => {
    const response = await api.get(`/positions/${positionId}`);
    return response.data;
  },

  // Create new position
  createPosition: async (positionData) => {
    const response = await api.post(`/positions`, positionData);
    return response.data;
  },

  // Update position
  updatePosition: async (positionId, positionData) => {
    const response = await api.put(`/positions/${positionId}`, positionData);
    return response.data;
  },

  // Close position
  closePosition: async (positionId, closeData) => {
    const response = await api.post(
      `/positions/${positionId}/close`,
      closeData
    );
    return response.data;
  },

  // Put position on hold
  putOnHold: async (positionId, reason) => {
    const response = await api.patch(`/positions/${positionId}/status`, {
      status: "ON_HOLD",
      reason,
    });
    return response.data;
  },

  // Reopen position
  reopenPosition: async (positionId) => {
    const response = await api.patch(`/positions/${positionId}/status`, {
      status: "OPEN",
    });
    return response.data;
  },

  // Get position applications
  getPositionApplications: async (positionId) => {
    const response = await api.get(`/positions/${positionId}/applications`);
    return response.data;
  },

  // Get matching candidates for position
  getMatchingCandidates: async (positionId) => {
    const response = await api.get(`/candidates/matching/${positionId}`);
    return response.data;
  },

  // Add required skills to position
  addPositionSkills: async (positionId, skillsData) => {
    const response = await api.post(
      `/positions/${positionId}/skills`,
      skillsData
    );
    return response.data;
  },

  // Remove required skills from position
  removeRequiredSkills: async (positionId, skillIds) => {
    const response = await api.delete(`/positions/${positionId}/skills`, {
      data: { skillIds },
    });
    return response.data;
  },

  // Assign reviewers to position
  assignReviewer: async (positionId, reviewerId) => {
    const response = await api.put(
      `/positions/${positionId}/assign-reviewer?reviewerId=${reviewerId}`
    );
    return response.data;
  },

  // Get position analytics
  getPositionAnalytics: async (positionId) => {
    const response = await api.get(`/reports/position/${positionId}`);
    return response.data;
  },
};

export const candidateService = {
  // Get all candidates
  getCandidates: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/candidates?${params}`);
    return response.data;
  },

  // Get single candidate
  getCandidateById: async (candidateId) => {
    const response = await api.get(`/candidates/${candidateId}`);
    return response.data;
  },

  // Create new candidate
  createCandidate: async (candidateData) => {
    const response = await api.post(`/candidates`, candidateData);
    return response.data;
  },

  // Update candidate
  updateCandidate: async (candidateId, candidateData) => {
    const response = await api.put(`/candidates/${candidateId}`, candidateData);
    return response.data;
  },

  // Upload CV
  uploadCV: async (candidateId, file, positionId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (positionId) {
      formData.append("positionId", positionId);
    }
    const response = await api.post(`/candidates/${candidateId}/cv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Create candidate from CV
  createCandidateFromCV: async (file, positionId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (positionId) {
      formData.append("positionId", positionId);
    }
    const response = await api.post(`/candidates/from-cv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get candidate CVs
  getCandidateCVs: async (candidateId) => {
    const response = await api.get(`/candidates/${candidateId}/cvs`);
    return response.data;
  },

  // Bulk upload candidates
  bulkUploadCandidates: async (candidateData) => {
    const response = await api.post(`/candidates/bulk-upload`, candidateData);
    return response.data;
  },

  // Add skills to candidate
  addSkills: async (candidateId, skillData) => {
    const response = await api.post(
      `/candidates/${candidateId}/skills`,
      skillData
    );
    return response.data;
  },

  // Get candidate applications
  getCandidateApplications: async (candidateId) => {
    const response = await api.get(`/applications?candidateId=${candidateId}`);
    return response.data;
  },

  // Apply candidate to position
  applyToPosition: async (candidateId, positionId, cvId = null) => {
    const response = await api.post(`/candidates/${candidateId}/apply`, {
      positionId,
      cvId,
    });
    return response.data;
  },
};

export const applicationService = {
  // Get all applications
  getApplications: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/applications?${params}`);
    return response.data;
  },

  // Get single application
  getApplicationById: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  // Create application (candidate applies to position)
  createApplication: async (candidateId, positionId, cvId = null) => {
    const response = await api.post(`/applications`, {
      candidateId,
      positionId,
      cvId,
    });
    return response.data;
  },

  // Update application status
  updateApplicationStatus: async (applicationId, status, reason = "") => {
    const response = await api.put(`/applications/${applicationId}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  // Move application to screening
  moveToScreening: async (applicationId) => {
    const response = await api.put(
      `/applications/${applicationId}/move-to-screening`
    );
    return response.data;
  },

  // Move application to interview
  moveToInterview: async (applicationId) => {
    const response = await api.put(
      `/applications/${applicationId}/move-to-interview`
    );
    return response.data;
  },

  // Put application on hold
  putOnHold: async (applicationId, reason) => {
    const response = await api.put(
      `/applications/${applicationId}/hold?reason=${encodeURIComponent(reason)}`
    );
    return response.data;
  },

  // Reject application
  rejectApplication: async (applicationId, reason) => {
    const response = await api.put(
      `/applications/${applicationId}/reject?reason=${encodeURIComponent(
        reason
      )}`
    );
    return response.data;
  },

  // Select candidate
  selectCandidate: async (applicationId) => {
    const response = await api.put(`/applications/${applicationId}/select`);
    return response.data;
  },

  // Get application timeline
  getApplicationTimeline: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}/timeline`);
    return response.data;
  },
};

export const interviewService = {
  // Get all interviews
  getInterviews: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/interviews?${params}`);
    return response.data;
  },

  // Get single interview
  getInterviewById: async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  // Schedule interview
  scheduleInterview: async (scheduleData) => {
    const response = await api.post(`/interviews/schedule`, scheduleData);
    return response.data;
  },

  // Bulk schedule interviews
  scheduleBulkInterviews: async (bulkData) => {
    const response = await api.post(`/interviews/bulk-schedule`, bulkData);
    return response.data;
  },

  // Reschedule interview
  rescheduleInterview: async (interviewId, newDate) => {
    const response = await api.put(
      `/interviews/${interviewId}/reschedule?newDate=${encodeURIComponent(
        newDate
      )}`
    );
    return response.data;
  },

  // Cancel interview
  cancelInterview: async (interviewId) => {
    const response = await api.put(`/interviews/${interviewId}/cancel`);
    return response.data;
  },

  // Mark interview as completed
  completeInterview: async (interviewId) => {
    const response = await api.put(`/interviews/${interviewId}/complete`);
    return response.data;
  },

  // Define interview rounds for position
  defineRounds: async (positionId, rounds) => {
    const response = await api.post(
      `/interviews/rounds/define?positionId=${positionId}`,
      rounds
    );
    return response.data;
  },

  // Get interview rounds for position
  getPositionRounds: async (positionId) => {
    const response = await api.get(`/interviews/rounds/position/${positionId}`);
    return response.data;
  },

  // Get interviews by application
  getInterviewsByApplication: async (applicationId) => {
    const response = await api.get(`/interviews/application/${applicationId}`);
    return response.data;
  },

  // Get my interviews
  getMyInterviews: async () => {
    const response = await api.get(`/interviews/my-interviews`);
    return response.data;
  },
};

export const feedbackService = {
  // Submit screening feedback
  submitScreeningFeedback: async (feedbackData) => {
    const response = await api.post(`/screening/feedback`, feedbackData);
    return response.data;
  },

  // Get screening feedback
  getScreeningFeedback: async (applicationId) => {
    const response = await api.get(
      `/screening/feedback/application/${applicationId}`
    );
    return response.data;
  },

  // Get latest screening feedback
  getLatestScreeningFeedback: async (applicationId) => {
    const response = await api.get(
      `/screening/feedback/application/${applicationId}/latest`
    );
    return response.data;
  },

  // Add screening comment
  addScreeningComment: async (commentData) => {
    const response = await api.post(`/screening/comments`, commentData);
    return response.data;
  },

  // Get screening comments
  getScreeningComments: async (applicationId) => {
    const response = await api.get(
      `/screening/comments/application/${applicationId}`
    );
    return response.data;
  },

  // Submit interview feedback
  submitInterviewFeedback: async (interviewId, feedbackData) => {
    const response = await api.post(
      `/interviews/${interviewId}/feedback`,
      feedbackData
    );
    return response.data;
  },

  // Get interview feedback
  getInterviewFeedback: async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}/feedback`);
    return response.data;
  },

  // Check candidate history
  checkCandidateHistory: async (applicationId) => {
    const response = await api.post(
      `/screening/application/${applicationId}/check-history`
    );
    return response.data;
  },

  // Get history notifications
  getHistoryNotifications: async (applicationId) => {
    const response = await api.get(
      `/screening/notifications/application/${applicationId}`
    );
    return response.data;
  },
};

export const documentService = {
  // Get candidate documents
  getCandidateDocuments: async (applicationId) => {
    const response = await api.get(`/documents/application/${applicationId}`);
    return response.data;
  },

  // Upload document
  uploadDocument: async (applicationId, documentTypeId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicationId", applicationId);
    formData.append("documentTypeId", documentTypeId);
    const response = await api.post(`/documents/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Verify document
  verifyDocument: async (documentId, status, remarks = "") => {
    const response = await api.put(`/documents/${documentId}/verify`, {
      status,
      remarks,
    });
    return response.data;
  },

  // Get pending documents
  getPendingDocuments: async () => {
    const response = await api.get(`/documents/pending`);
    return response.data;
  },

  // Get document types
  getDocumentTypes: async () => {
    const response = await api.get(`/documents/types`);
    return response.data;
  },
};

export const offerService = {
  // Generate offer letter
  generateOffer: async (offerData) => {
    const response = await api.post(`/offers/generate`, offerData);
    return response.data;
  },

  // Get offer details
  getOfferById: async (offerId) => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
  },

  // Send offer to candidate
  sendOffer: async (offerId) => {
    const response = await api.put(`/offers/${offerId}/send`);
    return response.data;
  },

  // Accept offer
  acceptOffer: async (offerId) => {
    const response = await api.put(`/offers/${offerId}/accept`);
    return response.data;
  },

  // Reject offer
  rejectOffer: async (offerId, reason) => {
    const response = await api.put(
      `/offers/${offerId}/reject?reason=${encodeURIComponent(reason)}`
    );
    return response.data;
  },

  // Withdraw offer
  withdrawOffer: async (offerId) => {
    const response = await api.put(`/offers/${offerId}/withdraw`);
    return response.data;
  },

  // Get offers by application
  getOffersByApplication: async (applicationId) => {
    const response = await api.get(`/offers/application/${applicationId}`);
    return response.data;
  },

  // Get all offers
  getOffers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/offers?${params}`);
    return response.data;
  },
};

export const reportService = {
  // Position-wise report
  getPositionReport: async (positionId) => {
    const response = await api.get(`/reports/position/${positionId}`);
    return response.data;
  },

  // Overall recruitment summary
  getRecruitmentSummary: async (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const response = await api.get(
      `/reports/summary${params.toString() ? "?" + params.toString() : ""}`
    );
    return response.data;
  },

  // Custom report
  getCustomReport: async (requestData) => {
    const response = await api.post(`/reports/custom`, requestData);
    return response.data;
  },
};

export const userService = {
  // Get all users
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/users?${params}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post(`/users`, userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Change password
  changePassword: async (userId, oldPassword, newPassword) => {
    const response = await api.patch(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

export const skillService = {
  // Get all skills
  getSkills: async () => {
    const response = await api.get(`/skills`);
    return response.data;
  },

  // Create skill
  createSkill: async (skillData) => {
    const response = await api.post(`/skills`, skillData);
    return response.data;
  },

  // Update skill
  updateSkill: async (skillId, skillData) => {
    const response = await api.put(`/skills/${skillId}`, skillData);
    return response.data;
  },

  // Delete skill
  deleteSkill: async (skillId) => {
    const response = await api.delete(`/skills/${skillId}`);
    return response.data;
  },
};

export const roleService = {
  // Get all roles
  getRoles: async () => {
    const response = await api.get(`/roles`);
    return response.data;
  },
};

export const notificationService = {
  // Get my notifications
  getMyNotifications: async () => {
    const response = await api.get(`/notifications/my-notifications`);
    return response.data;
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    const response = await api.get(`/notifications/unread`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get(`/notifications/unread/count`);
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await api.put(
      `/notifications/${notificationId}/mark-read`
    );
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put(`/notifications/mark-all-read`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export const reviewService = {
  // Get all reviews
  getReviews: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/reviews?${params}`);
    return response.data;
  },

  // Get review by ID
  getReviewById: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },

  // Create new review
  createReview: async (reviewData) => {
    const response = await api.post(`/reviews`, reviewData);
    return response.data;
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Get reviews for application
  getApplicationReviews: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}/reviews`);
    return response.data;
  },

  // Submit review feedback
  submitReviewFeedback: async (reviewId, feedback) => {
    const response = await api.post(`/reviews/${reviewId}/feedback`, feedback);
    return response.data;
  },
};
