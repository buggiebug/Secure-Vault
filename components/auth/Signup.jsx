import { signupUser } from "@/redux/slice/authSlice";
import React, { useEffect, useState } from "react";
import {
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

const SignupScreen = ({ handleSwitchLoginSignup }) => {
  const [loginMethod, setLoginMethod] = useState("mobile"); // "email" or "mobile"
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const { name, email, mobile, password } = signupForm;
    const isValidName = name.trim().length > 0;
    const isValidPassword = /^\d{6}$/.test(password);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email.trim());
    const isValidMobile = /^[0-9]{10}$/.test(mobile);
    const isValidContact =
      loginMethod === "email" ? isValidEmail : isValidMobile;

    setIsNextButtonDisabled(
      !(isValidName && isValidContact && isValidPassword)
    );
  }, [signupForm, loginMethod]);

  const handleSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      const signupData = {
        name: signupForm.name,
        password: signupForm.password,
      };
      if (loginMethod === "email") {
        signupData.email = signupForm.email.trim();
      }
      if (loginMethod === "mobile") {
        signupData.mobile = signupForm.mobile.trim();
      }
      // Your signup logic here
      dispatch(signupUser(signupData));
    }, 1500);
  };

  const switchLoginMethod = (method) => {
    if (method !== loginMethod) {
      setLoginMethod(method);
      setSignupForm({
        ...signupForm,
        email: "",
        mobile: "",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up with your details below</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#bbb"
                value={signupForm.name}
                onChangeText={(text) =>
                  setSignupForm({ ...signupForm, name: text })
                }
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginMethod === "email" && styles.toggleButtonActive,
                ]}
                onPress={() => switchLoginMethod("email")}
                accessibilityLabel="Sign up with Email"
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
                onPress={() => switchLoginMethod("mobile")}
                accessibilityLabel="Sign up with Mobile"
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

            {loginMethod === "mobile" && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9120226043"
                  placeholderTextColor="#bbb"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={signupForm.mobile}
                  onChangeText={(text) =>
                    setSignupForm({ ...signupForm, mobile: text.trim() })
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {loginMethod === "email" && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@domain.com"
                  placeholderTextColor="#bbb"
                  keyboardType="email-address"
                  value={signupForm.email}
                  onChangeText={(text) =>
                    setSignupForm({ ...signupForm, email: text.trim() })
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>6-Digit PIN</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter 6-digit PIN"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!passwordVisible}
                  keyboardType="numeric"
                  maxLength={6}
                  value={signupForm.password}
                  onChangeText={(text) =>
                    setSignupForm({ ...signupForm, password: text.trim() })
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  accessibilityLabel={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                >
                  <Text style={styles.eyeIcon}>
                    {passwordVisible ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.signupButton,
                isNextButtonDisabled && styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={isNextButtonDisabled || loading}
              activeOpacity={0.8}
              accessibilityLabel="Sign up button"
            >
              <Text style={styles.buttonText}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text
                  style={styles.switchText}
                  onPress={() => handleSwitchLoginSignup("login")}
                >
                  Log in here
                </Text>
              </Text>
            </View>

            <Text style={styles.privacyText}>
              This app is protected by advanced encryption and security
              measures.
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flexGrow: 1, paddingVertical: 40, paddingHorizontal: 20 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logoIcon: { fontSize: 48, color: "#3366FF" },
  logoText: { fontSize: 28, fontWeight: "700", color: "#3366FF", marginTop: 8 },
  content: { flex: 1 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
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
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 25,
    backgroundColor: "#eee",
    marginBottom: 24,
    overflow: "hidden",
  },
  toggleButton: { flex: 1, paddingVertical: 13, alignItems: "center" },
  toggleButtonActive: { backgroundColor: "#3366FF" },
  toggleText: { fontSize: 16, color: "#888", fontWeight: "600" },
  toggleTextActive: { color: "#fff", fontWeight: "700" },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeButton: {
    marginLeft: 10,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 22,
  },
  signupButton: {
    borderRadius: 25,
    backgroundColor: "#3366FF",
    paddingVertical: 16,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonDisabled: {
    backgroundColor: "#a3c0ff",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  footer: {
    alignItems: "center",
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  switchText: {
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

export default SignupScreen;
