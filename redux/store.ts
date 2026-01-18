// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "./slice/authSlice";
import passwordManagerSlice from "./slice/passwordManagerSlice";
import todoReducer from "./slice/todoSlice";

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

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedPmReducer = persistReducer(pmPersistConfig, passwordManagerSlice);

const persistedTodoReducer = persistReducer(todoPersistConfig, todoReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    pm: persistedPmReducer,

    todo: persistedTodoReducer,
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

// ✅ Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
