import localStorage from "@/components/utils/localStorage";
import { getUser } from "@/redux/slice/authSlice";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import Auth from "./auth/Auth";
import useFetchData from "./auth/useAuth";
import { useNetInfo } from "@react-native-community/netinfo";
import NoInternet from "./utils/NoInternet";
import useNotifications from "@/hooks/useNotifications";

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useDispatch();

  // Get auth state from Redux
  const { isLoggedInUser, userData, loadingStatus, loadingModal } =
    useFetchData();

  // Register for push notifications when user is logged in
  const { expoPushToken, notification } = useNotifications(isLoggedInUser);

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
  }, [dispatch, isLoggedInUser]);

  // Handle getUser response
  useEffect(() => {
    if (loadingStatus === "succeeded" || loadingStatus === "failed") {
      setIsInitialized(true);
    }
  }, [loadingStatus]);

  // Network Check
  const netInfo = useNetInfo();
  if (netInfo.isConnected === false) {
    return <NoInternet />;
  }

  // Show loading spinner while initializing
  if (
    !isInitialized ||
    (loadingStatus === "loading" && !["login", "signup", "forgotPassword", "logout", "deleteUser"].includes(loadingModal))
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

  console.log("User is authenticated, rendering main app.");
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
