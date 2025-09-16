import localStorage from "@/components/utils/localStorage";
import Notify from "@/components/utils/Notify";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

// ----------------- Initial State -----------------
const initialState = {
  isLoggedIn: false,
  userData: {},
  loadingStatus: "idle",
  loadingModal: "",
  error: null,
  isInitializing: false,
};

// ----------------- Thunks -----------------

// Push notification token
export const pushNotification = createAsyncThunk(
  "auth/pushNotification",
  async (token, { rejectWithValue }) => {
    try {
      console.log("Token : ", token);
      const { data } = await axiosInstance.post(
        `/api/app/notification/store-token`,
        token
      );
      return data;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);

// Signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("Registration form: ", credentials);
      const { data } = await axiosInstance.post(
        `/api/auth/signup`,
        credentials
      );
      const token = data?.data?.userToken || data?.data?.token;
      if (!token) {
        throw new Error("No token received from server");
      }

      // Store token first
      await localStorage.setItem("userToken", token);
      Notify(data.message, 0);

      // Then get user data to ensure consistency
      const userResponse = await axiosInstance.get(`/api/auth/user/me`);

      return {
        ...data,
        userData: userResponse.data,
        token,
      };
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);

// Check user by email
export const checkUserExistUsingEmail = createAsyncThunk(
  "auth/checkUserExistUsingEmail",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/auth/userexist`,
        credentials
      );
      return data;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      return rejectWithValue(err);
    }
  }
);

// Login - FIXED to prevent crashes
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("credentials, ", credentials);
      const { data } = await axiosInstance.post(`/api/auth/login`, credentials);
      const token = data?.data?.userToken || data?.data?.token;
      if (!token) {
        throw new Error("No token received from server");
      }

      // Store token first
      await localStorage.setItem("userToken", token);
      Notify(data.message, 0);

      // Then get user data to ensure consistency
      const userResponse = await axiosInstance.get(`/api/auth/user/me`);

      return {
        ...data,
        userData: userResponse.data,
        token,
      };
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err); // UNCOMMENT THIS LINE - this is crucial!
    }
  }
);

// Delete User
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/api/auth/deleteUser`);

      // Remove token after successful deletion
      await localStorage.removeItem("userToken");

      Notify("Account deleted successfully", 0);
      return true;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/auth/forgot-password`,
        credentials
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

// Logout - FIXED
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Logout triggered");
      await localStorage.removeItem("userToken");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    try {
      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const token = await localStorage.getItem("userToken");
      if (!token) {
        clearTimeout(timeoutId);
        return rejectWithValue("No token found");
      }

      console.log("GetUser: Making API request...");
      const { data } = await axiosInstance.get(`/api/auth/user/me`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("GetUser: API request successful");
      return data;
    } catch (error) {
      const err =
        error?.response?.data?.message || error?.message || "Network error";
      console.error("GetUser: Error occurred:", err);

      // Handle different types of errors
      if (error.name === "AbortError") {
        console.error("GetUser: Request timeout");
        return rejectWithValue(
          "Request timeout - please check your connection"
        );
      }

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log("GetUser: Invalid token, removing...");
        try {
          await localStorage.removeItem("userToken");
        } catch (removeError) {
          console.warn("GetUser: Failed to remove token:", removeError);
        }
      }

      return rejectWithValue(err);
    }
  }
);

// Update User
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

      const response = await axiosInstance.get(`/api/auth/user/me`);

      if (!userData?.location) Notify(message, 0);

      return response?.data;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // console.log("InitAuth: Starting initialization...");

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Initialization timeout")), 10000); // 10 second timeout
      });

      const initPromise = async () => {
        try {
          // Check if localStorage is available
          if (typeof localStorage === "undefined") {
            console.log(
              "InitAuth: localStorage not available, assuming fresh start"
            );
            return { hasToken: false, userData: null };
          }

          const token = await localStorage.getItem("userToken");
          console.log(
            "InitAuth: Token check result:",
            token ? "Found" : "Not found"
          );

          if (token) {
            // console.log("InitAuth: Token found, getting user data...");

            try {
              // Try to get user data with the existing token
              const result = await dispatch(getUser()).unwrap();
              // console.log("InitAuth: User data retrieved successfully");
              return { hasToken: true, userData: result };
            } catch (getUserError) {
              console.log(
                "InitAuth: Failed to get user data, token may be invalid:",
                getUserError
              );

              // If token is invalid, remove it and start fresh
              try {
                await localStorage.removeItem("userToken");
                // console.log("InitAuth: Removed invalid token");
              } catch (removeError) {
                console.warn(
                  "InitAuth: Failed to remove invalid token:",
                  removeError
                );
              }

              return { hasToken: false, userData: null };
            }
          } else {
            console.log("InitAuth: No token found, user needs to login");
            return { hasToken: false, userData: null };
          }
        } catch (error) {
          console.error("InitAuth: Error in initialization process:", error);

          // Try to clean up any corrupted state
          try {
            await localStorage.removeItem("userToken");
          } catch (cleanupError) {
            console.warn("InitAuth: Cleanup failed:", cleanupError);
          }

          return { hasToken: false, userData: null };
        }
      };

      // Race between initialization and timeout
      const result = await Promise.race([initPromise(), timeoutPromise]);

      // console.log("InitAuth: Initialization completed:", result);
      return result;
    } catch (error) {
      console.error("InitAuth: Critical initialization error:", error);

      // Always return a safe state rather than crashing
      return { hasToken: false, userData: null };
    }
  }
);

// ----------------- Slice -----------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Reset auth state
    resetAuthState: (state) => {
      state.isLoggedIn = false;
      state.userData = {};
      state.loadingStatus = "idle";
      state.loadingModal = "";
      state.error = null;
    },
    // Set loading states manually if needed
    setLoadingState: (state, action) => {
      state.loadingStatus = action.payload.status;
      state.loadingModal = action.payload.modal;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
        state.loadingStatus = "loading";
        state.loadingModal = "initialize";
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.loadingStatus = "succeeded";
        state.loadingModal = "initialize";

        if (action.payload.hasToken && action.payload.userData) {
          state.isLoggedIn = true;
          state.userData = action.payload.userData;
        } else {
          state.isLoggedIn = false;
          state.userData = {};
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitializing = false;
        state.loadingStatus = "failed";
        state.loadingModal = "initialize";
        state.isLoggedIn = false;
        state.userData = {};
      })

      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "signup";
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "signup";
        state.error = null;

        const token = action.payload?.userToken || action.payload?.token;
        if (token) {
          state.isLoggedIn = true;
          // Set user data if available
          if (action.payload?.user) {
            state.userData = action.payload.user;
          }
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "signup";
        state.error = action.payload || action.error.message;
        state.isLoggedIn = false;
        state.userData = {};
      })

      // Login - FIXED
      .addCase(loginUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "login";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "login";
        state.error = null;

        // console.log("Login fulfilled with payload:", action.payload);

        const token = action.payload?.userToken || action.payload?.token;
        if (token) {
          state.isLoggedIn = true;
          // Set user data from the combined response
          if (action.payload?.userData) {
            state.userData = action.payload.userData;
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "login";
        state.error = action.payload || action.error.message;
        state.isLoggedIn = false;
        state.userData = {};
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "deleteUser";
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "deleteUser";
        state.isLoggedIn = false;
        state.userData = {};
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "deleteUser";
        state.error = action.payload || action.error.message;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "forgotPassword";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "forgotPassword";
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "forgotPassword";
        state.error = action.payload || action.error.message;
      })

      // Logout - FIXED
      .addCase(logoutUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "logout";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "logout";
        state.isLoggedIn = false;
        state.userData = {};
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "logout";
        state.error = action.payload || action.error.message;
        // Still log out even if there's an error
        state.isLoggedIn = false;
        state.userData = {};
      })

      // Get User - FIXED
      .addCase(getUser.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "getUser";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "getUser";
        state.isLoggedIn = true;
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "getUser";
        state.isLoggedIn = false;
        state.userData = {};
        state.error = action.payload || action.error.message;
      })

      // Update User
      .addCase(updateUserProfile.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "updateUserProfile";
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "updateUserProfile";
        if (action.payload) {
          state.userData = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "updateUserProfile";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError, resetAuthState, setLoadingState } =
  authSlice.actions;
export default authSlice.reducer;
