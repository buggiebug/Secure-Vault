// store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import passwordManagerSlice from "./slice/passwordManagerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pm: passwordManagerSlice,
  },
});

// ✅ Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
