import PasswordManager from "@/components/passwordManager/PasswordManager";
import { selectUserDetails } from "@/redux/reselect/reselectData";
import {
  fetchGroups,
  fetchPasswords,
} from "@/redux/slice/passwordManagerSlice";
import type { AppDispatch } from "@/redux/store";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";

export default function PasswordManagerScreen() {
  const dispatch = useDispatch<AppDispatch>();
  // Get auth state from Redux
  const { isLoggedInUser, userData } = useSelector(selectUserDetails);

  // Run only when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isLoggedInUser && userData) {
        dispatch(fetchGroups());
        dispatch(fetchPasswords());
      }
    }, [dispatch, isLoggedInUser, userData])
  );

  return <PasswordManager />;
}
