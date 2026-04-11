import api from "../api/axios";

const CANDIDATE_API_BASE_URL = "/candidates";

export const candidateService = {
  // Create candidate profile manually
  createCandidate: async (candidateData) => {
    try {
      const response = await api.post(CANDIDATE_API_BASE_URL, candidateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload CV for candidate
  uploadCV: async (candidateId, positionId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (positionId) {
        formData.append("positionId", positionId);
      }

      // Use /me/cv endpoint if no candidateId provided (candidate uploading their own CV)
      const endpoint = candidateId
        ? `${CANDIDATE_API_BASE_URL}/${candidateId}/cv`
        : `${CANDIDATE_API_BASE_URL}/me/cv`;

      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk upload candidates from Excel
  bulkUploadCandidates: async (candidateData) => {
    try {
      const response = await api.post(
        `${CANDIDATE_API_BASE_URL}/bulk-upload`,
        candidateData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add skills to candidate
  addCandidateSkill: async (
    candidateId,
    skillId,
    proficiencyLevelId,
    yearsOfExperience,
  ) => {
    try {
      const payload = {
        skillId,
        proficiencyLevelId,
      };
      if (yearsOfExperience !== null && yearsOfExperience !== undefined) {
        payload.yearsOfExperience = yearsOfExperience;
      }
      const response = await api.post(
        `${CANDIDATE_API_BASE_URL}/${candidateId}/skills`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all candidates
  getAllCandidates: async () => {
    try {
      const response = await api.get(CANDIDATE_API_BASE_URL);
      console.log("getAllCandidates response:", response.data);

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (
        response.data &&
        response.data.candidates &&
        Array.isArray(response.data.candidates)
      ) {
        return response.data.candidates;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      } else {
        console.warn("Unexpected response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get candidate by ID
  getCandidateById: async (candidateId) => {
    try {
      const response = await api.get(
        `${CANDIDATE_API_BASE_URL}/${candidateId}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search candidates by criteria
  searchCandidates: async (searchParams) => {
    try {
      const response = await api.get(`${CANDIDATE_API_BASE_URL}/search`, {
        params: searchParams,
      });
      console.log("searchCandidates response:", response.data);

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (
        response.data &&
        response.data.candidates &&
        Array.isArray(response.data.candidates)
      ) {
        return response.data.candidates;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      } else {
        console.warn("Unexpected response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error searching candidates:", error);
      throw error.response?.data || error.message;
    }
  },

  // Find candidates matching job requirements
  findCandidatesForPosition: async (positionId) => {
    try {
      const response = await api.get(
        `${CANDIDATE_API_BASE_URL}/for-position/${positionId}`,
      );
      console.log("findCandidatesForPosition response:", response.data);

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (
        response.data &&
        response.data.candidates &&
        Array.isArray(response.data.candidates)
      ) {
        return response.data.candidates;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      } else {
        console.warn("Unexpected response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error finding candidates for position:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update candidate profile
  updateCandidate: async (candidateId, candidateData) => {
    try {
      const response = await api.put(
        `${CANDIDATE_API_BASE_URL}/${candidateId}`,
        candidateData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Deactivate candidate
  deactivateCandidate: async (candidateId) => {
    try {
      const response = await api.delete(
        `${CANDIDATE_API_BASE_URL}/${candidateId}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get candidate's CVs
  getCandidateCVs: async (candidateId) => {
    try {
      const endpoint = candidateId
        ? `${CANDIDATE_API_BASE_URL}/${candidateId}/cvs`
        : `${CANDIDATE_API_BASE_URL}/me/cvs`;

      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get candidate's skills
  getCandidateSkills: async (candidateId) => {
    try {
      // If no candidateId, use /me endpoint for current candidate
      const endpoint = candidateId
        ? `${CANDIDATE_API_BASE_URL}/${candidateId}/skills`
        : `${CANDIDATE_API_BASE_URL}/me/skills`;

      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete candidate skill
  deleteCandidateSkill: async (candidateSkillId) => {
    try {
      const response = await api.delete(
        `${CANDIDATE_API_BASE_URL}/skills/${candidateSkillId}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Link candidate to a position (create application)
  linkCandidateToPosition: async (candidateId, positionId, cvId) => {
    try {
      const response = await api.post(
        `${CANDIDATE_API_BASE_URL}/${candidateId}/apply`,
        { positionId, cvId },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create candidate by uploading CV (no existing candidateId)
  createCandidateFromCV: async (positionId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (positionId) formData.append("positionId", positionId);

      const response = await api.post(
        `${CANDIDATE_API_BASE_URL}/from-cv`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get candidates matching a position
  getMatchingCandidates: async (positionId) => {
    try {
      const response = await api.get(
        `${CANDIDATE_API_BASE_URL}/matching/${positionId}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
