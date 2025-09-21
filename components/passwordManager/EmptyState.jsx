// components/EmptyState.js
import { Animated, StyleSheet, Text } from "react-native";

const EmptyState = ({ fadeAnim }) => {
  return (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Text style={styles.emptyIcon}>🔒</Text>
      <Text style={styles.emptyTitle}>No passwords yet</Text>
      <Text style={styles.emptyText}>
        Tap the + button to add your first password
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export { EmptyState };
