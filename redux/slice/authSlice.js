import localStorage from "@/components/utils/localStorage";
import Notify from "@/components/utils/Notify";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

// Define initial state
const initialState = {
  isLoggedIn: false,
  userData: {},
  getMyActivity: [],
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

// Forgot User...
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (credentials) => {
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
    }
  }
);

// Logout User...
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  console.log("Loggout triggred");
  await localStorage.removeItem("userToken");
  return { isLoggedIn: false };
});

// Get User...
export const getUser = createAsyncThunk("auth/getUser", async () => {
  try {
    const { data } = await axiosInstance.get(`/api/auth/user/me`);
    return data;
  } catch (error) {
    const err = error?.response?.data?.message || error?.message;
    console.log(err);
    // Notify(err, 1);
    return false;
  }
});

// Update User...
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (updateData) => {
    try {
      const { userData, message } = updateData;
      console.log("Update user data: ", userData);
      const { data } = await axiosInstance.patch(
        `/api/auth/userupdate`,
        userData
      );
      const response = await axiosInstance.get(`/api/auth/getuser`);
      if (!userData?.location) Notify(message, 0);
      return response?.data;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
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
        state.isLoggedIn = !state.isLoggedIn;
        localStorage.removeAll("userToken");
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
        state.isLoggedIn = !state.isLoggedIn;
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
          state.userData = action.payload;
        }
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "getUser";
        // On rejection, user is not authenticated
        state.isLoggedIn = false;
        state.userData = {};
        localStorage.removeItem("userToken");
        state.error = action.error.message;
      })

      //  Update user
      .addCase(updateUserProfile.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "updateUserProfile";
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "updateUserProfile";
        state.userData = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "updateUserProfile";
        state.error = action.error.message;
      });
  },
});

export default authSlice.reducer;
