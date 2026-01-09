import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  positions: [],
  currentPosition: null,
  loading: false,
  error: null,
  filters: {
    status: null,
    department: null,
    search: null,
  },
};

const positionSlice = createSlice({
  name: "position",
  initialState,
  reducers: {
    setPositions: (state, action) => {
      state.positions = action.payload;
    },
    addPosition: (state, action) => {
      state.positions.push(action.payload);
    },
    updatePosition: (state, action) => {
      const index = state.positions.findIndex(
        (pos) => pos.positionId === action.payload.positionId
      );
      if (index !== -1) {
        state.positions[index] = action.payload;
      }
      if (
        state.currentPosition?.positionId === action.payload.positionId
      ) {
        state.currentPosition = action.payload;
      }
    },
    setCurrentPosition: (state, action) => {
      state.currentPosition = action.payload;
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
  setPositions,
  addPosition,
  updatePosition,
  setCurrentPosition,
  setLoading,
  setError,
  setFilters,
  clearError,
} = positionSlice.actions;

export default positionSlice.reducer;
