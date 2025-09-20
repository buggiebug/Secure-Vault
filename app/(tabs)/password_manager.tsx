import PasswordManager from "@/components/passwordManager/PasswordManager";
import { selectUserDetails } from "@/redux/reselect/reselectData";
import {
  fetchGroups,
  fetchPasswords,
} from "@/redux/slice/passwordManagerSlice";
import type { AppDispatch, } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function PasswordManagerScreen() {
  const dispatch = useDispatch<AppDispatch>();
  // Get auth state from Redux
  const { isLoggedInUser, userData } = useSelector(selectUserDetails);

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchPasswords());
  }, [dispatch, isLoggedInUser, userData]);

  return <PasswordManager />;
}
