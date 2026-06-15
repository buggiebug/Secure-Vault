import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import axiosInstance from "@/redux/api/axiosInstance";
import { store } from "@/redux/store";
import { addNotification } from "@/redux/slice/notificationSlice";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Hook to manage push notifications.
 * - Requests permission
 * - Gets FCM push token (Expo project token)
 * - Sends token to backend for storage
 * - Listens for incoming notifications
 *
 * @param {boolean} isLoggedIn - Whether the user is currently logged in
 * @returns {{ expoPushToken, notification, error }}
 */
export default function useNotifications(isLoggedIn) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Only register for push notifications if the user is logged in
    if (!isLoggedIn) return;

    let isMounted = true;

    async function register() {
      try {
        const token = await registerForPushNotificationsAsync();
        if (isMounted && token) {
          setExpoPushToken(token);
          // Send the FCM token to backend so it can be stored against the user
          await saveFcmTokenToBackend(token);
        }
      } catch (err) {
        console.error("Push notification registration failed:", err);
        if (isMounted) setError(err.message);
      }
    }

    register();

    // Listener: fires when a notification is received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        if (isMounted) setNotification(notif);
        console.log("🔔 Notification received:", notif.request.content.title);

        // Store notification in Redux for the notifications page
        const content = notif.request.content;
        store.dispatch(addNotification({
          title: content.title,
          body: content.body,
          imageUrl: content.data?.imageUrl || null,
          data: content.data || {},
        }));
      });

    // Listener: fires when the user taps on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const content = response.notification.request.content;
        const data = content.data;
        console.log("👆 Notification tapped, data:", data);

        // Also store tapped notifications (in case they arrived while app was in background)
        store.dispatch(addNotification({
          title: content.title,
          body: content.body,
          imageUrl: data?.imageUrl || null,
          data: data || {},
        }));
      });

    return () => {
      isMounted = false;
      // Clean up notification listeners safely
      // In Expo Go, removeNotificationSubscription may not be available
      if (notificationListener.current) {
        try {
          if (notificationListener.current.remove) {
            notificationListener.current.remove();
          } else if (Notifications.removeNotificationSubscription) {
            Notifications.removeNotificationSubscription(notificationListener.current);
          }
        } catch (e) {
          // Silently ignore cleanup errors
        }
      }
      if (responseListener.current) {
        try {
          if (responseListener.current.remove) {
            responseListener.current.remove();
          } else if (Notifications.removeNotificationSubscription) {
            Notifications.removeNotificationSubscription(responseListener.current);
          }
        } catch (e) {
          // Silently ignore cleanup errors
        }
      }
    };
  }, [isLoggedIn]);

  return { expoPushToken, notification, error };
}

/**
 * Requests notification permissions and returns the FCM device push token.
 * This uses the native device token (FCM for Android, APNs for iOS)
 * which is compatible with firebase-admin on the backend.
 */
async function registerForPushNotificationsAsync() {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device.");
    return null;
  }

  // Set up Android notification channel (required for Android 8+)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });
  }

  // Check and request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Notification permission not granted.");
    return null;
  }

  // Get the native device push token (FCM token on Android)
  // This is the token firebase-admin's messaging().send() expects
  const devicePushToken = await Notifications.getDevicePushTokenAsync();
  console.log("📱 FCM Device Push Token:", devicePushToken.data);

  return devicePushToken.data;
}

/**
 * Sends the FCM token to the backend to store it against the authenticated user.
 */
async function saveFcmTokenToBackend(token) {
  try {
    await axiosInstance.patch("/api/auth/user/me/update", {
      fcmToken: token,
    });
    console.log("✅ FCM token saved to backend");
  } catch (err) {
    console.error("❌ Failed to save FCM token to backend:", err.message);
  }
}
