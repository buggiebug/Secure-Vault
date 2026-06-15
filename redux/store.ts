// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "./slice/authSlice";
import passwordManagerSlice from "./slice/passwordManagerSlice";
import todoReducer from "./slice/todoSlice";
import expenseReducer from "./slice/expenseSlice";
import notificationReducer from "./slice/notificationSlice";

// Persist configuration for auth slice
const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: ["isLoggedIn", "userData"], // Only persist these fields
  blacklist: ["loadingStatus", "loadingModal", "error"], // Don't persist loading states
};

// Persist configuration for password manager slice
const pmPersistConfig = {
  key: "pm",
  storage: AsyncStorage,
  blacklist: ["passwords", "loadingStatus", "error"], // Don't persist sensitive password data
  whitelist: ["groups"], // Only persist group metadata
};


// Persist configuration for todo slice
const todoPersistConfig = {
    key: "todo",
    storage: AsyncStorage,
    whitelist: ["tasks"],
  };

// Persist configuration for expense slice
const expensePersistConfig = {
    key: "expense",
    storage: AsyncStorage,
    whitelist: ["expenseData"],
    blacklist: ["loadingStatus", "loadingModal", "error", "message"],
};

// Persist configuration for notification slice
const notificationPersistConfig = {
    key: "notifications",
    storage: AsyncStorage,
    whitelist: ["notifications", "unreadCount"],
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedPmReducer = persistReducer(pmPersistConfig, passwordManagerSlice);

const persistedTodoReducer = persistReducer(todoPersistConfig, todoReducer);
const persistedExpenseReducer = persistReducer(expensePersistConfig, expenseReducer);
const persistedNotificationReducer = persistReducer(notificationPersistConfig, notificationReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    pm: persistedPmReducer,
    expense: persistedExpenseReducer,
    todo: persistedTodoReducer,
    notifications: persistedNotificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Inject store to axios instance for interceptors
import { injectStore } from "./api/axiosInstance";
injectStore(store);

// ✅ Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
