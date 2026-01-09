import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
  filters: {
    status: null,
    positionId: null,
    candidateId: null,
  },
};

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.applications = action.payload;
    },
    addApplication: (state, action) => {
      state.applications.push(action.payload);
    },
    updateApplication: (state, action) => {
      const index = state.applications.findIndex(
        (app) => app.applicationId === action.payload.applicationId
      );
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
      if (
        state.currentApplication?.applicationId ===
        action.payload.applicationId
      ) {
        state.currentApplication = action.payload;
      }
    },
    setCurrentApplication: (state, action) => {
      state.currentApplication = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setApplications,
  addApplication,
  updateApplication,
  setCurrentApplication,
  setLoading,
  setError,
  setFilters,
  clearError,
} = applicationSlice.actions;

export default applicationSlice.reducer;
