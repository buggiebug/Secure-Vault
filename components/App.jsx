import localStorage from "@/components/utils/localStorage";
import { getUser } from "@/redux/slice/authSlice";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import Auth from "./auth/Auth";
import useFetchData from "./auth/useAuth";

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useDispatch();

  // Get auth state from Redux
  const { isLoggedInUser, userData, loadingStatus, loadingModal } =
    useFetchData();

  // Initialize authentication check only once
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await localStorage.getItem("userToken");

        if (token) {
          // Only dispatch getUser if we have a token
          dispatch(getUser());
        } else {
          // No token, user is not logged in
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error checking token:", error);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isLoggedInUser]); // Empty dependency array - runs only once

  // Handle getUser response
  useEffect(() => {
    if (loadingStatus === "succeeded" || loadingStatus === "failed") {
      setIsInitialized(true);
    }
  }, [loadingStatus]);

  // Show loading spinner while initializing
  if (
    !isInitialized ||
    (loadingStatus === "loading" && !["login", "signup"].includes(loadingModal))
  ) {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "black",
          }}
        >
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: "white", marginTop: 12 }}>Loading...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show Auth screen if not authenticated
  if (!isLoggedInUser || !Object.keys(userData).length) {
    return <Auth />;
  }

  // Render main app if authenticated
  return (
    <Stack key="authenticated-stack">
      <Stack.Screen
        name="(tabs)"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
