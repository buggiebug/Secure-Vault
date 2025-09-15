import Notify from "@/components/utils/Notify";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

// ----------------- Initial State -----------------
const initialState = {
  groups: [], // list of groups
  passwords: [], // list of saved passwords
  loadingStatus: "idle",
  loadingModal: "",
  error: null,
};

// ----------------- Thunks -----------------

// Add Group
export const addGroup = createAsyncThunk(
  "pm/addGroup",
  async (groupData, { rejectWithValue }) => {
    try {
      // console.log(groupData);
      await axiosInstance.post(`/api/pm/groups`, groupData);
      Notify("Group added successfully", 0);
      const { data } = await axiosInstance.get(`/api/pm/groups`);
      return data?.data || [];
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);

// Get Groups
export const fetchGroups = createAsyncThunk(
  "pm/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/pm/groups`);
      return data?.data || [];
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      return rejectWithValue(err);
    }
  }
);

// Delete Group
export const deleteGroup = createAsyncThunk(
  "pm/deleteGroup",
  async (groupId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/pm/groups/${groupId}`);
      Notify("Group deleted successfully", 0);
      return groupId;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);

// Add Password
export const addPassword = createAsyncThunk(
  "pm/addPassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/pm/passwords`,
        passwordData
      );
      Notify("Password added successfully", 0);
      return data?.data || [];
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);

// Get Passwords
export const fetchPasswords = createAsyncThunk(
  "pm/fetchPasswords",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/pm/passwords`);
      return data?.data || [];
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      return rejectWithValue(err);
    }
  }
);

// Delete Password
export const deletePassword = createAsyncThunk(
  "pm/deletePassword",
  async (passwordId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/pm/passwords/${passwordId}`);
      Notify("Password deleted successfully", 0);
      return passwordId;
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      Notify(err, 1);
      return rejectWithValue(err);
    }
  }
);

// ----------------- Slice -----------------
const passwordManager = createSlice({
  name: "pm",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- GROUPS ----------
      .addCase(fetchGroups.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "fetchGroups";
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "fetchGroups";
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "fetchGroups";
        state.error = action.payload;
      })

      .addCase(addGroup.pending, (state, action) => {
        state.loadingStatus = "loading";
        state.loadingModal = "addGroup";
      })
      .addCase(addGroup.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "addGroup";
        if (action.payload) state.groups = action.payload;
      })
      .addCase(addGroup.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "addGroup";
      })

      .addCase(deleteGroup.pending, (state, action) => {
        state.loadingModal = "deleteGroup";
        state.loadingStatus = "loading";
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loadingModal = "deleteGroup";
        state.loadingStatus = "succeeded";
        state.groups = state.groups.filter((g) => g._id !== action.payload);
        state.passwords = state.passwords.filter((p) => p.group !== action.payload);
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loadingModal = "deleteGroup";
        state.loadingStatus = "failed";
      })

      // ---------- PASSWORDS ----------
      .addCase(fetchPasswords.pending, (state) => {
        state.loadingStatus = "loading";
        state.loadingModal = "fetchPasswords";
      })
      .addCase(fetchPasswords.fulfilled, (state, action) => {
        state.loadingStatus = "succeeded";
        state.loadingModal = "fetchPasswords";
        state.passwords = action.payload;
      })
      .addCase(fetchPasswords.rejected, (state, action) => {
        state.loadingStatus = "failed";
        state.loadingModal = "fetchPasswords";
        state.error = action.payload;
      })

      .addCase(addPassword.fulfilled, (state, action) => {
        if (action.payload) state.passwords.push(action.payload);
      })
      .addCase(deletePassword.fulfilled, (state, action) => {
        state.passwords = state.passwords.filter(
          (p) => p._id !== action.payload
        );
      });
  },
});

export const { clearError } = passwordManager.actions;
export default passwordManager.reducer;
