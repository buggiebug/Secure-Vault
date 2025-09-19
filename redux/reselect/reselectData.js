import { createSelector } from "reselect";

const selectUserData = (state) => state.auth;
export const selectUserDetails = createSelector(
  [selectUserData],
  (userDetails) => ({
    isLoggedInUser: userDetails?.isLoggedIn,
    loadingStatus: userDetails?.loadingStatus,
    loadingModal: userDetails?.loadingModal,
    userData: userDetails?.userData,
    myActivity: userDetails?.getMyActivity,
  })
);

const selectPasswordState = (state) => state.pm;
export const selectPasswordDetails = createSelector(
  [selectPasswordState],
  (password) => ({
    groupsData: password?.groups || [],
    passwordsData: password?.passwords || [],
    loadingModal: password?.loadingModal || "",
    loadingStatus: password?.loadingStatus || "idle",
    error: password?.error || null,
  })
);