import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import passwordManagerSlice from "./slice/passwordManagerSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    pm: passwordManagerSlice,
  },
});

export default store;
