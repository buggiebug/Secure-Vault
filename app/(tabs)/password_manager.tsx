import PasswordManager from "@/components/passwordManager/PasswordManager";
import {
  fetchGroups,
  fetchPasswords,
} from "@/redux/slice/passwordManagerSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function PasswordManagerScreen() {
  const dispatch = useDispatch<AppDispatch>();
  // Get auth state from Redux
  const { isLoggedIn, userData } = useSelector(
    (state: RootState) => ({
      isLoggedIn: state.auth.isLoggedIn,
      userData: state.auth.userData,
      loadingStatus: state.auth.loadingStatus,
      loadingModal: state.auth.loadingModal,
    })
  );

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchPasswords());
  }, [dispatch, isLoggedIn, userData]);

  return <PasswordManager />;
}
