import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  globalLoading: false,
  authCheckComplete: false,
};

const normalizeRole = (role) => {
  if (!role) {
    return role;
  }

  const rawRole = typeof role === "object" ? role.roleName || role.name : role;
  return rawRole
    ? String(rawRole)
        .replace(/^ROLE_/, "")
        .toUpperCase()
    : rawRole;
};

const normalizeUserPayload = (payload) => {
  const role = normalizeRole(payload?.role || payload?.roleName);
  const id =
    payload?.id ??
    payload?.userId ??
    payload?.user?.userId ??
    payload?.user?.id;
  const userId =
    payload?.userId ??
    payload?.id ??
    payload?.user?.userId ??
    payload?.user?.id;
  const name =
    payload?.name ||
    `${payload?.firstName || ""} ${payload?.lastName || ""}`.trim() ||
    payload?.email ||
    "User";
  return { ...payload, role, roleName: role, id, userId, name };
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const normalized = normalizeUserPayload(action.payload);
      state.loading = false;
      state.currentUser = normalized;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    signupStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action) => {
      const normalized = normalizeUserPayload(action.payload);
      state.loading = false;
      state.currentUser = normalized;
      state.isAuthenticated = true;
      state.error = null;
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = normalizeUserPayload(action.payload);
      state.error = null;
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    setAuthCheckComplete: (state, action) => {
      state.authCheckComplete = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout,
  updateProfileStart,
  updateProfileSuccess,
  setAuthCheckComplete,
  updateProfileFailure,
  clearError,
  setGlobalLoading,
} = userSlice.actions;

export default userSlice.reducer;
