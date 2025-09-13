import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import LogoutTabButton from "./logout";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="password_manager"
        options={{
          title: "Secure Vault",
          tabBarIcon: ({ color }) => (
            <IconSymbol icon="material" size={28} name="lock" color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="logout"
        options={{
          title: "Logout",
          tabBarIcon: ({ color }) => (
            <IconSymbol icon="ant" size={28} name="logout" color={'#fff'} />
          ),
          tabBarButton: LogoutTabButton,
        }}
        // This prevents the logout tab from actually navigating anywhere
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
    </Tabs>
  );
}