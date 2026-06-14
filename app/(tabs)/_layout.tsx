import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View, Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#308d84", // Match the teal theme
        tabBarInactiveTintColor: "#8e8e93",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff", // Light background
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0", // Light separator
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 8,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="expense_manager"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <IconSymbol icon="material" size={24} name="attach-money" color={focused ? "#308d84" : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notes_manager"
        options={{
          title: "Todo",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <IconSymbol icon="material" size={24} name="notes" color={focused ? "#308d84" : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="password_manager"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <IconSymbol icon="material" size={24} name="lock" color={focused ? "#308d84" : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <IconSymbol icon="material" size={24} name="person" color={focused ? "#308d84" : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    width: 64,
    borderRadius: 16,
  },
  activeIconContainer: {
    backgroundColor: "#e6f4f1", // Light teal pill
  },
});