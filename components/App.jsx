// App.js - Updated to show loading only for specific scenarios
import { useAuth } from "@/components/auth/useAuth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
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
const ErrorScreen = ({ onRetry }) => (
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
        Something went wrong
      </Text>
      <Text
        style={{
          color: "#ccc",
          fontSize: 14,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        There was an error loading the application
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

// Error Boundary
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      if (args[0] && typeof args[0] === "string" && args[0].includes("Error")) {
        console.log("Error boundary caught:", args[0]);
        setHasError(true);
      }
    };
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  if (hasError) {
    return <ErrorScreen onRetry={() => setHasError(false)} />;
  }

  return children;
}

// Main App Content
function AppContent() {
  const { isAuthenticated, isInitialized, loading, error, loadingModal } =
    useAuth();
  const colorScheme = useColorScheme();

  console.log("App render state:", {
    isAuthenticated,
    isInitialized,
    loading,
    error,
    loadingModal,
  });

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
      <ErrorScreen onRetry={() => console.log("Manual retry triggered")} />
    );
  }

  try {
    const content = isAuthenticated ? (
      <Stack key="authenticated-stack">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="+not-found"
          options={{ title: "Not Found", headerShown: true }}
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
          {content}
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  } catch (renderError) {
    console.error("App render error:", renderError);
    return <ErrorScreen onRetry={() => console.log("Render error retry")} />;
  }
}

// Main App Export
export default function App() {
  return (
    // <ErrorBoundary>
    <AppContent />
    // </ErrorBoundary>
  );
}
