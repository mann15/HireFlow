import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPositions, getPositionById } from "../../services/positionService";
import { setPositions, setCurrentPosition, setLoading, setError } from "../positionSlice";

export const fetchPositions = createAsyncThunk(
  "position/fetchPositions",
  async (filters = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const data = await getPositions(filters);
      dispatch(setPositions(data || []));
      return data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to fetch positions";
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchPositionById = createAsyncThunk(
  "position/fetchPositionById",
  async (positionId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const data = await getPositionById(positionId);
      dispatch(setCurrentPosition(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to fetch position";
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
