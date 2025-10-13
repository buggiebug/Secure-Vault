import { selectUserDetails } from "@/redux/reselect/reselectData";
import { forgotPassword } from "@/redux/slice/authSlice";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Notify from "../utils/Notify";

export default function ForgotPassword({ handleSwitchLoginSignup }) {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const { loadingStatus, loadingModal } = useSelector(selectUserDetails);

  const dispatch = useDispatch();
  const handleEmailChange = (text) => {
    setEmail(text.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(text.trim()));
  };

  const handleResetPassword = () => {
    if (!isValidEmail) {
      Notify("Please enter a valid email address", 0);
      return;
    }
    dispatch(forgotPassword({ email }));
  };

  useEffect(() => {
    if (loadingStatus === "succeeded" && loadingModal === "forgotPassword") {
      setEmail("");
    }
  }, [loadingStatus, loadingModal]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={{ marginTop: 20 }}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🔐</Text>
          <Text style={styles.logoText}>SecureVault</Text>
        </View>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we&apos;ll send you a link to reset your password
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="user@domain.com"
            placeholderTextColor="#bbb"
            keyboardType="email-address"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          activeOpacity={0.8}
          onPress={handleResetPassword}
          disabled={
            (loadingStatus === "loading" &&
              loadingModal === "forgotPassword") ||
            !isValidEmail
          }
        >
          <LinearGradient
            colors={
              (loadingStatus === "loading" &&
                loadingModal === "forgotPassword") ||
              !isValidEmail
                ? ["#a6c8ff", "#87aade"] // Disabled lighter blue
                : ["#007bff", "#0056b3"] // Blue gradient
            }
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.2, y: 0 }}
            disabled={!isValidEmail === 0 ? true : false}
          >
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Remember your password?{" "}
          <Text
            style={styles.signInText}
            onPress={() => handleSwitchLoginSignup("login")}
          >
            Log in here
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // White background
    padding: 20,
    justifyContent: "flex-start",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 48,
    color: "#3366FF",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3366FF",
    marginTop: 8,
  },
  title: {
    color: "#000", // Black text
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#555", // Dark gray
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#444", marginBottom: 6 },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
  },
  resetButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 10,
  },
  gradientButton: {
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  footerText: {
    color: "#333",
    textAlign: "center",
    marginTop: 30,
  },
  signInText: {
    color: "#3366FF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
