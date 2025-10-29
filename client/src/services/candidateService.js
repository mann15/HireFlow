import axios from "axios";

const CANDIDATE_API_BASE_URL = "/api/candidates";

export const candidateService = {
  // Create candidate profile manually
  createCandidate: async (candidateData) => {
    try {
      const response = await axios.post(CANDIDATE_API_BASE_URL, candidateData);
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
      formData.append("positionId", positionId);

      const response = await axios.post(
        `${CANDIDATE_API_BASE_URL}/${candidateId}/cv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk upload candidates from Excel
  bulkUploadCandidates: async (candidateData) => {
    try {
      const response = await axios.post(
        `${CANDIDATE_API_BASE_URL}/bulk-upload`,
        candidateData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add skills to candidate
  addCandidateSkill: async (candidateId, skillId, proficiencyLevelId) => {
    try {
      const response = await axios.post(
        `${CANDIDATE_API_BASE_URL}/${candidateId}/skills`,
        {
          skillId,
          proficiencyLevelId,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all candidates
  getAllCandidates: async () => {
    try {
      const response = await axios.get(CANDIDATE_API_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get candidate by ID
  getCandidateById: async (candidateId) => {
    try {
      const response = await axios.get(
        `${CANDIDATE_API_BASE_URL}/${candidateId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search candidates by criteria
  searchCandidates: async (searchParams) => {
    try {
      const response = await axios.get(`${CANDIDATE_API_BASE_URL}/search`, {
        params: searchParams,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Find candidates matching job requirements
  findCandidatesForPosition: async (positionId) => {
    try {
      const response = await axios.get(
        `${CANDIDATE_API_BASE_URL}/for-position/${positionId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update candidate profile
  updateCandidate: async (candidateId, candidateData) => {
    try {
      const response = await axios.put(
        `${CANDIDATE_API_BASE_URL}/${candidateId}`,
        candidateData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Deactivate candidate
  deactivateCandidate: async (candidateId) => {
    try {
      const response = await axios.delete(
        `${CANDIDATE_API_BASE_URL}/${candidateId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get candidate's CVs
  getCandidateCVs: async (candidateId) => {
    try {
      const response = await axios.get(
        `${CANDIDATE_API_BASE_URL}/${candidateId}/cvs`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get candidate's skills
  getCandidateSkills: async (candidateId) => {
    try {
      const response = await axios.get(
        `${CANDIDATE_API_BASE_URL}/${candidateId}/skills`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Link candidate to a position (create application)
  linkCandidateToPosition: async (candidateId, positionId, cvId) => {
    try {
      const response = await axios.post(
        `${CANDIDATE_API_BASE_URL}/${candidateId}/apply`,
        { positionId, cvId }
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

      const response = await axios.post(
        `${CANDIDATE_API_BASE_URL}/from-cv`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
