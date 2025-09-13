import { HapticTab } from "@/components/haptic-tab";
import localStorage from "@/components/utils/localStorage"; // Add this import
import { logoutUser } from "@/redux/slice/authSlice";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";

// Custom logout tab button component
type LogoutTabButtonProps = {
  color: string;
  [key: string]: any;
};

const LogoutTabButton = ({ color, ...props }: LogoutTabButtonProps) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear local storage
            await localStorage.removeItem("userToken");

            // Dispatch logout action (this should handle API call and state cleanup)
            dispatch(logoutUser());
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return <HapticTab {...props} onPress={handleLogout} />;
};

export default LogoutTabButton;