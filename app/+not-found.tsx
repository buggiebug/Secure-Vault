// +not-found.js
import useFetchData from "@/components/auth/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  const { userData } = useFetchData();
  const router = useRouter();
  const [redirectTime, setRedirectTime] = useState(11);

  useEffect(() => {
    if (Object.keys(userData).length > 0) {
      const interval = setInterval(() => {
        setRedirectTime((prev) => prev - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        router.replace("/(tabs)/password_manager");
      }, 11000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [userData, router]);

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <LinearGradient colors={["#E0F7FA", "#80DEEA"]} style={styles.container}>
        <Text style={styles.title}>404 Vibes Only! 😎</Text>
        <Text style={styles.subtitle}>
          This page got lost in the sauce. Let&apos;s slide back to the main
          glow!
        </Text>

        <LinearGradient
          colors={["#3B82F6", "#06B6D4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Link href="/(tabs)/password_manager" asChild>
            <Text style={styles.linkText}>Go Home 🏠</Text>
          </Link>
        </LinearGradient>

        {/* Countdown text fixed at bottom */}
        {Object.keys(userData).length > 0 && (
          <View style={styles.bottomNotice}>
            <Text style={styles.redirectText}>
              Redirecting in {redirectTime}s
            </Text>
          </View>
        )}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E3A8A", // dark navy blue
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#1E40AF", // deeper blue
    opacity: 0.8,
    marginTop: 12,
    marginBottom: 25,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  linkText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase",
  },
  bottomNotice: {
    position: "absolute",
    bottom: 250,
    alignSelf: "center",
  },
  redirectText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E3A8A",
    opacity: 0.8,
  },
});
