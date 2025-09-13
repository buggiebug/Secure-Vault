// useAuth.js - Stable Custom Hook
import { selectUserDetails } from "@/redux/reselect/reselectData";
import { initializeAuth } from "@/redux/slice/authSlice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);
  const { isLoggedInUser, loadingStatus, loadingModal } =
    useSelector(selectUserDetails);

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth only once
  useEffect(() => {
    console.log("Initializing auth...");
    dispatch(initializeAuth());

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [dispatch]);

  // Track initialization completion
  useEffect(() => {
    if (loadingModal === "initialize" && (loadingStatus === "succeeded" || loadingStatus === "failed")) {
      setIsInitialized(true);
    }
  }, [loadingModal, loadingStatus]);

  // Handle login transition safely
  useEffect(() => {
    if (loadingModal === "login" && loadingStatus === "succeeded") {
      timeoutRef.current = setTimeout(() => {
        setIsInitialized(true);
      }, 500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loadingModal, loadingStatus]);

  return {
    isAuthenticated: !!isLoggedInUser,
    isInitialized,
    loading: loadingStatus === "loading",
    error: loadingStatus === "failed",
  };
};
