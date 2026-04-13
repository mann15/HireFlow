import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllApplications,
  getApplicationById,
  getApplicationsByPosition,
} from "../../services/applicationService";
import {
  setApplications,
  setCurrentApplication,
  updateApplication as updateAppAction,
  setLoading,
  setError,
} from "../applicationSlice";
import { reviewService } from "../../services/apiService";

export const fetchApplications = createAsyncThunk(
  "application/fetchApplications",
  async (filters = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const currentUser = filters.currentUser;
      const roleValue = currentUser?.role || currentUser?.roleName;
      const userRole = roleValue
        ? String(
            typeof roleValue === "object"
              ? roleValue?.roleName || roleValue?.name
              : roleValue,
          )
            .replace(/^ROLE_/, "")
            .toUpperCase()
        : null;

      let data;
      if (filters.positionId) {
        data = await getApplicationsByPosition(filters.positionId);
      } else if (userRole === "REVIEWER" && currentUser) {
        const reviewerId =
          currentUser.userId || currentUser.id || currentUser?.user?.id;
        const assignedPositions = await reviewService
          .getPositionsByReviewer(reviewerId)
          .catch(() => []);
        const positionIds = assignedPositions
          .map(
            (assignment) =>
              assignment.positionId || assignment.position?.positionId,
          )
          .filter(Boolean);

        const groupedApplications = await Promise.all(
          positionIds.map((positionId) =>
            getApplicationsByPosition(positionId).catch(() => []),
          ),
        );

        const uniqueApplications = new Map();
        groupedApplications.flat().forEach((application) => {
          if (application?.applicationId != null) {
            uniqueApplications.set(application.applicationId, application);
          }
        });

        data = Array.from(uniqueApplications.values());
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
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch applications";
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

export const fetchApplicationById = createAsyncThunk(
  "application/fetchApplicationById",
  async (applicationId, { dispatch, rejectWithValue }) => {
    // Validate applicationId
    if (
      !applicationId ||
      applicationId === "undefined" ||
      applicationId === "null"
    ) {
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
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch application";
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
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
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to update application";
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  },
);
