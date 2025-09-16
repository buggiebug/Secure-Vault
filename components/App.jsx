// App.js - Fixed version to prevent crashes after background clear
import { useAuth } from "@/components/auth/useAuth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, StatusBar, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Auth from "./auth/Auth";

export const unstable_settings = { anchor: "(tabs)" };

// Loading Screen
const LoadingScreen = ({ message = "Loading..." }) => (
  <SafeAreaProvider>
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{ color: "#fff", marginTop: 16, fontSize: 16 }}>
        {message}
      </Text>
    </SafeAreaView>
  </SafeAreaProvider>
);

// Error Screen
const ErrorScreen = ({ onRetry, message = "Something went wrong" }) => (
  <SafeAreaProvider>
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
      <Text
        style={{
          color: "#ccc",
          fontSize: 14,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Please try restarting the app
      </Text>
      {onRetry && (
        <View
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onTouchEnd={onRetry}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Retry</Text>
        </View>
      )}
    </SafeAreaView>
  </SafeAreaProvider>
);

// Error Boundary with better error handling
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");

  useEffect(() => {
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      originalConsoleError(...args);
      
      // Check for common crash patterns
      const errorString = args.join(" ");
      
      if (
        errorString.includes("Error") ||
        errorString.includes("TypeError") ||
        errorString.includes("ReferenceError") ||
        errorString.includes("Network request failed") ||
        errorString.includes("Cannot read property")
      ) {
        console.log("Error boundary caught:", errorString);
        setErrorInfo(errorString);
        setHasError(true);
      }
    };
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      setErrorInfo("Network or initialization error");
      setHasError(true);
    };
    
    window?.addEventListener?.("unhandledrejection", handleUnhandledRejection);
    
    return () => {
      console.error = originalConsoleError;
      window?.removeEventListener?.("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <ErrorScreen 
        message="App encountered an error" 
        onRetry={() => {
          setHasError(false);
          setErrorInfo("");
        }} 
      />
    );
  }

  return children;
}

// Main App Content with improved state management
function AppContent() {
  const { isAuthenticated, isInitialized, loading, error, loadingModal } = useAuth();
  const colorScheme = useColorScheme();
  const [appState, setAppState] = useState(AppState.currentState);
  const [hasAppError, setHasAppError] = useState(false);

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log("App state changed:", appState, "->", nextAppState);
      
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        console.log("App came to foreground");
        // Reset any error state when app comes back to foreground
        setHasAppError(false);
      }
      
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [appState]);

  // Add safety check for critical errors
  useEffect(() => {
    if (error && isInitialized) {
      console.warn("Critical app error detected:", error);
      setHasAppError(true);
    }
  }, [error, isInitialized]);

  // console.log("App render state:", {
  //   isAuthenticated,
  //   isInitialized,
  //   loading,
  //   error,
  //   loadingModal,
  //   appState,
  //   hasAppError
  // });

  // Show error screen for critical errors
  if (hasAppError) {
    return (
      <ErrorScreen 
        message="App needs to restart"
        onRetry={() => {
          setHasAppError(false);
          // Force re-initialization by reloading
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }} 
      />
    );
  }

  // Show loading screen only for:
  // 1. App initialization (!isInitialized)
  // 2. Successful login/signup transitions (loading && isAuthenticated)
  if (!isInitialized) {
    return <LoadingScreen message="Initializing app..." />;
  }

  if (
    loading &&
    isAuthenticated &&
    (loadingModal === "login" || loadingModal === "signup")
  ) {
    const message =
      loadingModal === "login"
        ? "Signing you in..."
        : "Setting up your account...";
    return <LoadingScreen message={message} />;
  }

  // Only show error screen for critical initialization errors
  if (error && !isInitialized) {
    return (
      <ErrorScreen 
        message="Failed to initialize app"
        onRetry={() => console.log("Manual retry triggered")} 
      />
    );
  }

  try {
    // Add safety checks for navigation
    const content = isAuthenticated ? (
      <Stack key="authenticated-stack">
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            // Add error boundary for navigation
            gestureEnabled: false 
          }} 
        />
        <Stack.Screen
          name="+not-found"
          options={{ 
            title: "Not Found", 
            headerShown: true,
            presentation: "modal"
          }}
        />
      </Stack>
    ) : (
      <Auth key="auth-component" />
    );

    return (
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <ErrorBoundary>
            {content}
          </ErrorBoundary>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  } catch (renderError) {
    console.error("App render error:", renderError);
    return (
      <ErrorScreen 
        message="Rendering error occurred"
        onRetry={() => {
          console.log("Render error retry");
          setHasAppError(false);
        }} 
      />
    );
  }
}

// Main App Export with Error Boundary
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}