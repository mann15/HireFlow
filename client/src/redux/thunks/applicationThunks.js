import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllApplications, getApplicationById, getApplicationsByPosition } from "../../services/applicationService";
import { setApplications, setCurrentApplication, updateApplication as updateAppAction, setLoading, setError } from "../applicationSlice";

export const fetchApplications = createAsyncThunk(
  "application/fetchApplications",
  async (filters = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      let data;
      if (filters.positionId) {
        data = await getApplicationsByPosition(filters.positionId);
      } else {
        data = await getAllApplications();
      }
      
      // Apply status filter if provided
      if (filters.status && filters.status !== "ALL") {
        data = data.filter((app) => app.status === filters.status);
      }
      
      dispatch(setApplications(data || []));
      return data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to fetch applications";
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  "application/fetchApplicationById",
  async (applicationId, { dispatch, rejectWithValue }) => {
    // Validate applicationId
    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      const message = "Invalid application ID";
      dispatch(setError(message));
      return rejectWithValue(message);
    }

    try {
      dispatch(setLoading(true));
      const data = await getApplicationById(applicationId);
      dispatch(setCurrentApplication(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to fetch application";
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateApplication = createAsyncThunk(
  "application/updateApplication",
  async ({ applicationId, updates }, { dispatch, rejectWithValue }) => {
    try {
      const data = await getApplicationById(applicationId);
      const updated = { ...data, ...updates };
      dispatch(updateAppAction(updated));
      return updated;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to update application";
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);
