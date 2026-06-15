import localStorage from "@/components/utils/localStorage";
import Notify from "@/components/utils/Notify";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import axiosInstance from "../api/axiosInstance";
import { syncTodosThunk } from "./todoSlice";

// Define initial state
const initialState = {
  isLoggedIn: false,
  userData: {},
  loadingStatus: "idle",
  loadingModal: "",
  error: null,
};

// Create User...
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (credentials) => {
    try {
      console.log("Registration form: ", credentials);
      const { data } = await axiosInstance.post(
        `/api/auth/signup`,
        credentials
      );
      Notify(data.message, 0);
      return data;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
    }
  }
);

// Login User...
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials) => {
    try {
      const { data } = await axiosInstance.post(`/api/auth/login`, credentials);
      Notify(data.message, 0);
      return data;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
    }
  }
);
export const deleteUser = createAsyncThunk("auth/deleteUser", async () => {
  try {
    const { data } = await axiosInstance.post(`/api/auth/deleteUser`);
    console.log(data);
    Notify("Account deleted successfully", 0);
    return true;
  } catch (error) {
    const err = error?.response?.data?.message || error?.message;
    Notify(err, 1);
  }
});

// Logout User...
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { dispatch, getState }) => {
  try {
    console.log("Logout triggered");

    // Sync pending notes to cloud before logging out
    const { todo } = getState();
    if (todo?.offlineQueue?.length > 0) {
      console.log(`Syncing ${todo.offlineQueue.length} pending changes before logout...`);
      try {
        // Wait for sync with a timeout to prevent hanging
        await Promise.race([
          dispatch(syncTodosThunk()).unwrap(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Sync timeout")), 10000)),
        ]);
        console.log("Pre-logout sync completed successfully");
      } catch (syncError) {
        console.warn("Pre-logout sync failed (data saved locally):", syncError);
      }
    }

    await localStorage.removeItem("userToken");

    // Purge persisted storage on logout
    const { persistor } = require("../store");
    await persistor.purge();

    Notify("Logged out successfully", 0);
    return { isLoggedIn: false };
  } catch (error) {
    console.error("Logout error:", error);
    // Even if purge fails, still logout the user
    Notify("Logged out successfully", 0);
    return { isLoggedIn: false };
  }
});

// Get User...
export const getUser = createAsyncThunk("auth/getUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/api/auth/user/me`);
    return data;
  } catch (error) {
    const errMessage = error?.response?.data?.message || error?.message;
    const status = error?.response?.status;
    console.log("Get user failed:", errMessage);
    // Return specific object to identifier error type
    return rejectWithValue({ message: errMessage, status });
  }
});

// Verify Pin...
export const verifyPassword = createAsyncThunk(
  "auth/verifyPassword",
  async (credentials) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/auth/user/verify-pin`,
        credentials
      );
      return data;
    } catch (error) {
      const err = error?.response?.data || error?.message;
      return err;
    }
  }
);

// Update User Pin...
export const updateUserPin = createAsyncThunk(
  "auth/updateUserPin",
  async (pinData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/api/auth/user/update-pin`,
        pinData
      );
      Notify(data.message, 0);
      return data;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);

// Update User...
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (updateData, { rejectWithValue }) => {
    try {
      const { userData, message } = updateData;
      console.log("Update user data: ", userData);
      const { data } = await axiosInstance.patch(
        `/api/auth/user/me/update`,
        userData
      );
      if (!userData?.location) Notify(message, 0);
      return data; // Return the full response, the reducer handles extracting .data
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);


// Forgot User...
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (credentials) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/auth/forgot-password`,
        credentials
      );
      Notify(data.message, 1);
      return data;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    forceLogout: (state) => {
      state.isLoggedIn = false;
      state.userData = {};
      state.loadingStatus = "idle";
      state.loadingModal = "";
      localStorage.removeItem("userToken");
    },
  },
  extraReducers: (builder) => {
    builder

      //  Handle signupUser
      .addCase(signupUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "signup";
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "signup";
        if (action.payload?.data?.token) {
          state.isLoggedIn = true; // Don't toggle, set to true
          localStorage.setItem("userToken", action.payload?.data?.token);
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "signup";
        state.error = action.error.message;
      })

      //  Handle loginUser
      .addCase(loginUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "login";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "login";
        console.log("Login performed");
        if (action.payload?.data?.token) {
          state.isLoggedIn = true; // Don't toggle, set to true
          localStorage.setItem("userToken", action.payload?.data?.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "login";
        state.error = action.error.message;
      })

      //  Handle deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "deleteUser";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "deleteUser";
        state.isLoggedIn = false;
        localStorage.removeItem("userToken");
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "deleteUser";
        state.error = action.error.message;
      })

      //  Handle forgotPassword
      .addCase(forgotPassword.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "forgotPassword";
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "forgotPassword";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "forgotPassword";
        state.error = action.error.message;
      })

      //  Handle Logout
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "logout";
        state.isLoggedIn = false;
        state.userData = {};
      })

      //  Handle getUser
      .addCase(getUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "getUser";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "getUser";

        if (action.payload === false) {
          state.isLoggedIn = false; // Set to false, don't toggle
          state.userData = {};
          localStorage.removeItem("userToken");
        } else {
          state.isLoggedIn = true; // User data received, set logged in
          state.userData = action.payload?.data || action.payload; // Handle wrapper
        }
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "getUser";

        const { status, message } = action.payload || {};

        // Only logout if it's explicitly an auth error or user not found
        // 401: Unauthorized, 403: Forbidden, 404: Not Found
        if (status === 401 || status === 403 || status === 404) {
          state.isLoggedIn = false;
          state.userData = {};
          localStorage.removeItem("userToken");
          state.error = message || "Authentication failed";
        } else {
          // Network error or server error - KEEP user logged in (optimistic)
          // Ideally we might want to show a "Offline" badge
          console.log("Network/Server error during getUser, keeping session alive.");
          state.error = message || action.error.message;
        }
      })

      //  Update user
      .addCase(updateUserProfile.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "updateUserProfile";
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "updateUserProfile";
        state.userData = action.payload?.data || action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "updateUserProfile";
        state.error = action.error.message;
      })

      // Update PIN
      .addCase(updateUserPin.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "updateUserPin";
      })
      .addCase(updateUserPin.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "updateUserPin";
      })
      .addCase(updateUserPin.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "updateUserPin";
        state.error = action.error.message;
      })

      // Handle PURGE action (on logout, clear persisted data)
      .addCase(PURGE, (state) => {
        return initialState; // Reset to initial state
      });
  },
});

export const { forceLogout } = authSlice.actions;
export default authSlice.reducer;
