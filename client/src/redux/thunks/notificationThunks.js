import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMyNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import {
  setNotifications,
  markAsRead as markReadAction,
  markAllAsRead as markAllReadAction,
  setLoading,
  setError,
} from "../notificationSlice";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (showAll = false, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const data = showAll ? await getMyNotifications() : await getUnreadNotifications();
      dispatch(setNotifications(data || []));
      return data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to fetch notifications";
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const count = await getUnreadCount();
      return count;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to fetch unread count";
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId, { dispatch, rejectWithValue }) => {
    try {
      await markAsRead(notificationId);
      dispatch(markReadAction(notificationId));
      return notificationId;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to mark as read";
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await markAllAsRead();
      dispatch(markAllReadAction());
      return true;
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Failed to mark all as read";
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);
