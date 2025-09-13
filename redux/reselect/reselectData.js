import { createSelector } from "reselect";

const selectAuthState = (state) => state.auth;

// Create a combined memoized selector with better default handling
export const selectUserDetails = createSelector(
  [selectAuthState],
  (auth) => {
    // Ensure we always return consistent values
    return {
      isLoggedInUser: Boolean(auth?.isLoggedIn),
      loadingModal: auth?.loadingModal || "",
      loadingStatus: auth?.loadingStatus || "idle",
      userData: auth?.userData || {},
      error: auth?.error || null,
      isInitializing: Boolean(auth?.isInitializing),
    };
  }
);


const selectPasswordState = (state) => state.pm;
// Combined memoized selector for password slice
export const selectPasswordDetails = createSelector(
  [selectPasswordState],
  (password) => {
    return {
      groupsData: password?.groups || [],
      passwordsData: password?.passwords || [],
      loadingModal: password?.loadingModal || "",
      loadingStatus: password?.loadingStatus || "idle",
      error: password?.error || null,
    };
  }
);