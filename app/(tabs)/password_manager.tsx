import PasswordManager from "@/components/passwordManager/PasswordManager";
import {
  fetchGroups,
  fetchPasswords
} from "@/redux/slice/passwordManagerSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function PasswordManagerScreen() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchPasswords());
  }, []);
  return <PasswordManager />;
}
