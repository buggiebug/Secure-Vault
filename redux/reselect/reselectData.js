import { createSelector } from "reselect";

const selectUserData = (state) => state.auth;
export const selectUserDetails = createSelector(
  [selectUserData],
  (userDetails) => ({
    isLoggedInUser: userDetails?.isLoggedIn,
    loadingStatus: userDetails?.loadingStatus,
    loadingModal: userDetails?.loadingModal,
    userData: userDetails?.userData || {},
  })
);

const selectPasswordState = (state) => state.pm;
export const selectPasswordDetails = createSelector(
  [selectPasswordState],
  (password) => ({
    groupsData: password?.groups || [],
    passwordsData: password?.passwords || [],
    loadingStatus: password?.loadingStatus || "idle",
    loadingModal: password?.loadingModal || "",
    error: password?.error || null,
  })
);