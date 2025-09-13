import React, { useState } from "react";
import { StatusBar } from "react-native";
import ForgotPassword from "./ForgetPassword";
import LoginScreen from "./Login";
import SignupScreen from "./Signup";

export default function Auth() {
  const [switchLoginSignup, setSwitchLoginSignup] = useState("login");
  const handleSwitchLoginSignup = (mode: string) => {
    setSwitchLoginSignup(mode);
  };

  return (
    <>
      <StatusBar
        animated={true}
        backgroundColor="black"
        barStyle={"light-content"}
      />
      {switchLoginSignup === "login" && (
        <LoginScreen handleSwitchLoginSignup={handleSwitchLoginSignup} />
      )}
      {switchLoginSignup === "signup" && (
        <SignupScreen handleSwitchLoginSignup={handleSwitchLoginSignup} />
      )}
      {switchLoginSignup === "forgotPassword" && (
        <ForgotPassword handleSwitchLoginSignup={handleSwitchLoginSignup} />
      )}
    </>
  );
}
