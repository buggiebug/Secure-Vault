import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

const initialState = {
  notifications: [], // Array of { id, title, body, imageUrl, data, receivedAt, read }
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const { title, body, imageUrl, data } = action.payload;
      const newNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: title || "SecureVault",
        body: body || "",
        imageUrl: imageUrl || null,
        data: data || {},
        receivedAt: Date.now(),
        read: false,
      };
      // Add to the beginning (newest first)
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;

      // Keep max 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    markAsRead: (state, action) => {
      const notifId = action.payload;
      const notif = state.notifications.find((n) => n.id === notifId);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const notifId = action.payload;
      const notif = state.notifications.find((n) => n.id === notifId);
      if (notif && !notif.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n.id !== notifId);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
