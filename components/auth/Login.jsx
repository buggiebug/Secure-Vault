import { loginUser } from "@/redux/slice/authSlice";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { useDispatch } from "react-redux";

const LoginScreen = ({ handleSwitchLoginSignup }) => {
  const [loginMethod, setLoginMethod] = useState("mobile");
  const [loginFormState, setLoginFormState] = useState({
    email: "",
    mobile: "",
    pin: "",
  });
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
  const [pinInputs, setPinInputs] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [focusedPinIndex, setFocusedPinIndex] = useState(null);

  const pinRefs = useRef([]);

  useEffect(() => {
    const { email, mobile, pin } = loginFormState;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;
    const isValidInput =
      loginMethod === "email"
        ? emailRegex.test(email.trim())
        : mobileRegex.test(mobile.trim());
    const isValidPin = pin.length === 6 && /^\d{6}$/.test(pin);
    setIsNextButtonDisabled(!(isValidInput && isValidPin));
  }, [loginFormState, loginMethod]);

  const dispatch = useDispatch();
  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const loginData = {};
      if (loginMethod === "email") {
        loginData.email = loginFormState.email;
      } else {
        loginData.mobile = loginFormState.mobile;
      }
      loginData.password = loginFormState.pin;
      dispatch(loginUser(loginData));
    }, 1500);
  };

  const switchLoginMethod = () => {
    const newMethod = loginMethod === "email" ? "mobile" : "email";
    setLoginMethod(newMethod);
    setLoginFormState({
      email: "",
      mobile: "",
      pin: "",
    });
    setPinInputs(["", "", "", "", "", ""]);
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    const newPinInputs = [...pinInputs];
    newPinInputs[index] = value;
    setPinInputs(newPinInputs);
    const fullPin = newPinInputs.join("");
    setLoginFormState({ ...loginFormState, pin: fullPin });
    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyPress = (index, key) => {
    if (key === "Backspace" && !pinInputs[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const renderPinInputs = () => (
    <View style={styles.pinContainer}>
      {pinInputs.map((pin, index) => (
        <View key={index} style={styles.pinInputWrapper}>
          <TextInput
            ref={(ref) => (pinRefs.current[index] = ref)}
            style={[
              styles.pinInput,
              pin && styles.pinInputFilled,
              focusedPinIndex === index && styles.pinInputFocused,
            ]}
            value={pin}
            onChangeText={(value) => handlePinChange(index, value)}
            onKeyPress={({ nativeEvent: { key } }) =>
              handlePinKeyPress(index, key)
            }
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
            textAlign="center"
            placeholderTextColor="#a0a0a0"
            onFocus={() => setFocusedPinIndex(index)}
            onBlur={() => setFocusedPinIndex(null)}
            accessibilityLabel={`PIN digit ${index + 1}`}
          />
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🔐</Text>
            <Text style={styles.logoText}>SecureVault</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Sign in with your {loginMethod === "email" ? "email" : "mobile"}{" "}
              and PIN
            </Text>

            {/* Login Method Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginMethod === "email" && styles.toggleButtonActive,
                ]}
                onPress={() => loginMethod !== "email" && switchLoginMethod()}
                accessibilityLabel="Sign in with email"
              >
                <Text
                  style={[
                    styles.toggleText,
                    loginMethod === "email" && styles.toggleTextActive,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginMethod === "mobile" && styles.toggleButtonActive,
                ]}
                onPress={() => loginMethod !== "mobile" && switchLoginMethod()}
                accessibilityLabel="Sign in with mobile"
              >
                <Text
                  style={[
                    styles.toggleText,
                    loginMethod === "mobile" && styles.toggleTextActive,
                  ]}
                >
                  Mobile
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {loginMethod === "email" ? "Email Address" : "Mobile Number"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={
                  loginMethod === "email" ? "name@domain.com" : "91 2022 6043"
                }
                placeholderTextColor="#a0a0a0"
                keyboardType={
                  loginMethod === "email" ? "email-address" : "phone-pad"
                }
                value={
                  loginMethod === "email"
                    ? loginFormState.email
                    : loginFormState.mobile
                }
                onChangeText={(text) => {
                  const field = loginMethod === "email" ? "email" : "mobile";
                  setLoginFormState({
                    ...loginFormState,
                    [field]: text.trim(),
                  });
                }}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={
                  loginMethod === "email"
                    ? "Email input"
                    : "Mobile number input"
                }
              />
            </View>

            {/* PIN Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>6-Digit PIN</Text>
              {renderPinInputs()}
            </View>

            {/* Forgot PIN */}
            <TouchableOpacity
              style={styles.forgotPinContainer}
              onPress={() => {
                handleSwitchLoginSignup("forgotPassword");
              }}
              accessibilityLabel="Forgot PIN"
              disabled
            >
              <Text style={styles.forgotPinText}>Forgot PIN?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isNextButtonDisabled && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isNextButtonDisabled || loading}
              activeOpacity={0.7}
              accessibilityLabel="Sign in button"
            >
              <View style={styles.loginButtonContent}>
                <Text style={styles.buttonText}>
                  {loading ? "Signing In..." : "Sign In"}
                </Text>
                {!loading && <Text style={styles.buttonIcon}>→</Text>}
              </View>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don&apos;t have an account?{" "}
                <Text
                  style={styles.signUpText}
                  onPress={() => {
                    handleSwitchLoginSignup("signup");
                  }}
                >
                  Sign up here
                </Text>
              </Text>
            </View>
            <Text style={styles.privacyText}>
              Protected by advanced encryption and security measures.
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
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
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 25,
    backgroundColor: "#e6e6e6",
    marginBottom: 24,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#3366FF",
  },
  toggleText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pinInputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  pinInput: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
    minHeight: 48,
  },
  pinInputFilled: {
    borderColor: "#3366FF",
  },
  pinInputFocused: {
    borderColor: "#3366FF",
    shadowColor: "#3366FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  forgotPinContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPinText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  loginButton: {
    borderRadius: 25,
    backgroundColor: "#3366FF",
    paddingVertical: 16,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#a3c0ff",
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    marginRight: 8,
  },
  buttonIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  signUpText: {
    color: "#3366FF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  privacyText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 10,
  },
});

export default LoginScreen;
