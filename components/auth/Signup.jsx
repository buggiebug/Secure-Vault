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

const SignupScreen = ({ handleSwitchLoginSignup }) => {
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
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
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
            placeholderTextColor="#90caf9"
            onFocus={() => setFocusedPinIndex(index)}
            onBlur={() => setFocusedPinIndex(null)}
          />
        </Animated.View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#add8e6" />
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoAnim,
                  transform: [
                    {
                      scale: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
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
              <Text style={styles.title}>Signup!</Text>
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
                  placeholderTextColor="#90caf9"
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
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.gradientButton,
                    {
                      transform: [{ scale: loading ? 0.95 : 1 }],
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
                  <Text style={styles.signUpText}>Sign up here</Text>
                </Text>
              </View>
              <Text style={styles.privacyText}>
                This app is protected by advanced encryption and security
                measures.
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
    backgroundColor: "#add8e6", // light blue
  },
  logoContainer: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 80 : 60,
    marginBottom: 40,
  },
  logoWrapper: {
    alignItems: "center",
  },
  logoIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  logoText: {
    color: "#3399ff",
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  title: {
    color: "#007bff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#b0c4de",
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#3399ff",
    shadowColor: "#3399ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#e3f2fd",
    borderRadius: 15,
    padding: 18,
    color: "#333",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#90caf9",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  pinInputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  pinInput: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 15,
    color: "#007bff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 2,
    borderColor: "#90caf9",
    minHeight: 55,
  },
  pinInputFilled: {
    borderColor: "#1976d2",
    backgroundColor: "#bbdefb",
  },
  pinInputFocused: {
    borderColor: "#007bff",
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  forgotPinContainer: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  forgotPinText: {
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  loginButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 30,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  gradientButton: {
    backgroundColor: "#3399ff",
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 25,
    shadowColor: "#3399ff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginRight: 8,
  },
  buttonIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    color: "#333",
    fontSize: 16,
  },
  signUpText: {
    color: "#3399ff",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  privacyText: {
    color: "#666",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default SignupScreen;
