import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";


export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "black", // 👈 Dark background
          borderTopColor: "rgba(255, 255, 255, 0.55)", // subtle divider
        },
        tabBarActiveTintColor: "white", // 👈 Active tab = white
        tabBarInactiveTintColor: "gray", // 👈 Inactive tab = gray
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >

      <Tabs.Screen
        name="notes_manager"
        options={{
          title: "Todo",
          tabBarIcon: ({ color }) => (
            <IconSymbol icon="material" size={28} name="notes" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="password_manager"
        options={{
          title: "Secure Vault",
          tabBarIcon: ({ color }) => (
            <IconSymbol icon="material" size={28} name="lock" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol icon="material" size={28} name="person" color={color} />
          ),
        }}
      />


    </Tabs>
  );
}