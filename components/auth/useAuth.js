// useAuth.js - Updated to show loading only for specific scenarios
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
  const [showLoading, setShowLoading] = useState(true); // Start with loading for initialization

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
    if (loadingModal === "initialize") {
      if (loadingStatus === "succeeded" || loadingStatus === "failed") {
        setIsInitialized(true);
        setShowLoading(false); // Hide loading after initialization
      }
    }
  }, [loadingModal, loadingStatus]);

  // Handle specific loading scenarios
  useEffect(() => {
    console.log("Loading check:", { loadingModal, loadingStatus });

    // Only show loading for these specific cases
    if (loadingModal === "initialize" && loadingStatus === "loading") {
      // App initialization
      setShowLoading(true);
    } else if (
      loadingModal === "login" &&
      loadingStatus === "succeeded" &&
      isLoggedInUser
    ) {
      // Successful login - show brief transition
      setShowLoading(true);
      timeoutRef.current = setTimeout(() => {
        setShowLoading(false);
      }, 800);
    } else if (
      loadingModal === "signup" &&
      loadingStatus === "succeeded" &&
      isLoggedInUser
    ) {
      // Successful signup - show brief transition
      setShowLoading(true);
      timeoutRef.current = setTimeout(() => {
        setShowLoading(false);
      }, 800);
    } else {
      // All other cases - hide loading
      setShowLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [loadingModal, loadingStatus, isLoggedInUser]);

  return {
    isAuthenticated: !!isLoggedInUser,
    isInitialized,
    loading: showLoading, // Use our custom loading state
    error:
      loadingStatus === "failed" &&
      loadingModal !== "login" &&
      loadingModal !== "signup", // Don't show errors for login/signup failures in main app
    loadingModal,
    loadingStatus,
  };
};
