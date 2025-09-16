// useAuth.js - Robust version that handles background app clearing
import { selectUserDetails } from "@/redux/reselect/reselectData";
import { initializeAuth, resetAuthState } from "@/redux/slice/authSlice";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);
  const initializationAttempts = useRef(0);
  const maxRetries = 3;
  
  const { isLoggedInUser, loadingStatus, loadingModal, error } =
    useSelector(selectUserDetails);

  const [isInitialized, setIsInitialized] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [hasInitializationError, setHasInitializationError] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  // Monitor app state for background/foreground transitions
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      // console.log("Auth: App state changed:", appState, "->", nextAppState);
      
      // If app comes back from background and we have errors, retry initialization
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        if (hasInitializationError || (!isInitialized && initializationAttempts.current > 0)) {
          console.log("Auth: Retrying initialization after background return");
          retryInitialization();
        }
      }
      
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [appState, hasInitializationError, isInitialized]);

  // Retry initialization function
  const retryInitialization = () => {
    if (initializationAttempts.current < maxRetries) {
      // console.log(`Auth: Retry attempt ${initializationAttempts.current + 1}/${maxRetries}`);
      
      // Reset states
      setHasInitializationError(false);
      setIsInitialized(false);
      setShowLoading(true);
      
      // Dispatch reset and re-initialize
      dispatch(resetAuthState());
      dispatch(initializeAuth());
      
      initializationAttempts.current++;
    } else {
      console.error("Auth: Max retry attempts reached");
      setHasInitializationError(true);
      setShowLoading(false);
    }
  };

  // Initialize auth only once on mount
  useEffect(() => {
    // console.log("Auth: Initializing auth...");
    initializationAttempts.current = 1;
    
    try {
      dispatch(initializeAuth());
    } catch (error) {
      console.error("Auth: Initialization dispatch failed:", error);
      setHasInitializationError(true);
      setShowLoading(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [dispatch]);

  // Track initialization completion with error handling
  useEffect(() => {
    // console.log("Auth: Status check:", { loadingModal, loadingStatus, error });
    
    if (loadingModal === "initialize") {
      if (loadingStatus === "succeeded") {
        // console.log("Auth: Initialization succeeded");
        setIsInitialized(true);
        setShowLoading(false);
        setHasInitializationError(false);
        initializationAttempts.current = 0; // Reset counter on success
      } else if (loadingStatus === "failed") {
        // console.log("Auth: Initialization failed, will retry");
        
        // Try to retry automatically
        setTimeout(() => {
          retryInitialization();
        }, 1000);
      }
    }
  }, [loadingModal, loadingStatus, error]);

  // Handle specific loading scenarios with improved error handling
  useEffect(() => {
    // console.log("Auth: Loading check:", { loadingModal, loadingStatus, isLoggedInUser });

    try {
      // Only show loading for these specific cases
      if (loadingModal === "initialize" && loadingStatus === "loading") {
        // App initialization
        setShowLoading(true);
      } else if (loadingModal === "login" && loadingStatus === "succeeded" && isLoggedInUser) {
        // Successful login - show brief transition
        setShowLoading(true);
        timeoutRef.current = setTimeout(() => {
          setShowLoading(false);
        }, 800);
      } else if (loadingModal === "signup" && loadingStatus === "succeeded" && isLoggedInUser) {
        // Successful signup - show brief transition
        setShowLoading(true);
        timeoutRef.current = setTimeout(() => {
          setShowLoading(false);
        }, 800);
      } else if (isInitialized) {
        // All other cases when app is initialized - hide loading
        setShowLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    } catch (error) {
      console.error("Auth: Error in loading logic:", error);
      setShowLoading(false);
      setHasInitializationError(true);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [loadingModal, loadingStatus, isLoggedInUser, isInitialized]);

  // Return comprehensive auth state
  return {
    isAuthenticated: !!isLoggedInUser,
    isInitialized,
    loading: showLoading,
    error: hasInitializationError || (loadingStatus === "failed" && !isInitialized),
    loadingModal,
    loadingStatus,
    // Additional debugging info
    initializationAttempts: initializationAttempts.current,
    maxRetries,
    retryInitialization, // Expose retry function for manual retry
  };
};