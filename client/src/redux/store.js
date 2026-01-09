import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import applicationReducer from "./applicationSlice";
import positionReducer from "./positionSlice";
import notificationReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    application: applicationReducer,
    position: positionReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
