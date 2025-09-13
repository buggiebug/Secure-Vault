import { loginUser } from "@/redux/slice/authSlice";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

const LoginScreen = ({ handleSwitchLoginSignup }) => {
  const [loginMethod, setLoginMethod] = useState("email");
  const [loginFormState, setLoginFormState] = useState({
    email: "",
    mobile: "",
    pin: "",
  });
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
  const [pinInputs, setPinInputs] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [focusedPinIndex, setFocusedPinIndex] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pinRefs = useRef([]);

  useEffect(() => {
    animateIn();
    startPulseAnimation();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
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
      console.log("Login attempt:", {
        method: loginMethod,
        credential:
          loginMethod === "email"
            ? loginFormState.email
            : loginFormState.mobile,
        pin: loginFormState.pin,
      });
      const loginData = {};
      if (loginMethod === "email") {
        loginData.email = loginFormState.email;
      } else {
        loginData.mobile = loginFormState.mobile;
      }
      loginData.password = loginFormState.pin;
      dispatch(loginUser(loginData));
    }, 2000);
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

  const renderPinInputs = () => (
    <View style={styles.pinContainer}>
      {pinInputs.map((pin, index) => (
        <Animated.View
          key={index}
          style={[
            styles.pinInputWrapper,
            {
              transform: [
                {
                  scale: pin ? pulseAnim : 1,
                },
              ],
            },
          ]}
        >
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
            placeholderTextColor="#A3BFFA"
            onFocus={() => setFocusedPinIndex(index)}
            onBlur={() => setFocusedPinIndex(null)}
            accessibilityLabel={`PIN digit ${index + 1}`}
          />
        </Animated.View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoAnim,
                  transform: [
                    {
                      scale: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.logoWrapper}>
                <Text style={styles.logoIcon}>🔐</Text>
                <Text style={styles.logoText}>SecureVault</Text>
              </View>
            </Animated.View>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Sign in with your{" "}
                {loginMethod === "email" ? "email" : "mobile number"} and PIN
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
                    📧 Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    loginMethod === "mobile" && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    loginMethod !== "mobile" && switchLoginMethod()
                  }
                  accessibilityLabel="Sign in with mobile"
                >
                  <Text
                    style={[
                      styles.toggleText,
                      loginMethod === "mobile" && styles.toggleTextActive,
                    ]}
                  >
                    📱 Mobile
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Input Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {loginMethod === "email"
                    ? "📧 Email Address"
                    : "📱 Mobile Number"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    loginMethod === "email" ? "name@domain.com" : "9876543210"
                  }
                  placeholderTextColor="#A3BFFA"
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
                    loginMethod === "email" ? "Email input" : "Mobile number input"
                  }
                />
              </View>
              {/* PIN Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>🔒 6-Digit PIN</Text>
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
                <Animated.View
                  style={[
                    styles.gradientButton,
                    {
                      transform: [{ scale: loading ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Text>
                  {!loading && <Text style={styles.buttonIcon}>→</Text>}
                </Animated.View>
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
                    disabled
                  >
                    Sign up here
                  </Text>
                </Text>
              </View>
              <Text style={styles.privacyText}>
                Protected by advanced encryption and security measures.
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E3A8A", // Dark blue for a modern look
  },
  logoContainer: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 100 : 80,
    marginBottom: 30,
  },
  logoWrapper: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 50,
    marginBottom: 5,
  },
  logoText: {
    color: "#1E3A8A",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    borderRadius: 30,
    padding: 4,
    marginBottom: 25,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 26,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    color: "#1E3A8A",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  pinInputWrapper: {
    flex: 1,
    marginHorizontal: 3,
  },
  pinInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    color: "#1E3A8A",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#3B82F6",
    minHeight: 50,
  },
  pinInputFilled: {
    borderColor: "#2563EB",
    backgroundColor: "#E0F2FE",
  },
  pinInputFocused: {
    borderColor: "#1E40AF",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  forgotPinContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPinText: {
    color: "#93C5FD",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  loginButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 25,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 17,
    marginRight: 8,
  },
  buttonIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    color: "#CBD5E1",
    fontSize: 15,
  },
  signUpText: {
    color: "#93C5FD",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  privacyText: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 15,
  },
});

export default LoginScreen;