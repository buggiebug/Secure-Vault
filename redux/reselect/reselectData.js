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

const selectExpenseState = (state) => state.expense;
export const selectExpenseDetails = createSelector(
  [selectExpenseState],
  (expense) => ({
    expenseData: expense?.expenseData || [],
    loadingStatus: expense?.loadingStatus || "idle",
    loadingModal: expense?.loadingModal || "",
    error: expense?.error || null,
    message: expense?.message || "",
  })
);