import { selectUserDetails } from "@/redux/reselect/reselectData";
import { forgotPassword } from "@/redux/slice/authSlice";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
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
    // Add your password reset logic here
    dispatch(forgotPassword({ email }));
  };

  useEffect(() => {
    if (loadingStatus === "succeeded" && loadingModal === "forgotPassword") {
      setEmail("");
    }
  }, [loadingStatus, loadingModal]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/android-icon-foreground.png")}
          alt="logo"
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.subtitle}>
        Enter your email and we&apos;ll send you a link to reset your password
      </Text>
      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        placeholder="name@domain.com"
        placeholderTextColor="#ccc"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={handleEmailChange}
      />
      <TouchableOpacity
        style={styles.resetButton}
        activeOpacity={0.8}
        onPress={handleResetPassword}
        disabled={
          (loadingStatus === "loading" && loadingModal === "forgotPassword") ||
          !isValidEmail
        }
      >
        <LinearGradient
          colors={
            (loadingStatus === "loading" &&
              loadingModal === "forgotPassword") ||
            !isValidEmail
              ? ["#595959", "#B3B3B3"]
              : ["#A800A6", "#FF4F01"]
          }
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0 }}
        >
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </LinearGradient>
      </TouchableOpacity>{" "}
      <Text style={styles.footerText}>
        Remember your password?{" "}{" "}
        <Text
          style={styles.signInText}
          onPress={() => handleSwitchLoginSignup("login")}
        >
          Log in here
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a001a",
    padding: 20,
    justifyContent: "flex-start",
  },
  logoContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 100,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    color: "white",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#2d002d",
    borderRadius: 8,
    padding: 12,
    color: "white",
    marginBottom: 30,
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
    color: "white",
    textAlign: "center",
    marginTop: 30,
  },
  signInText: {
    color: "#b300b3",
    textDecorationLine: "underline",
  },
});
