// components/PasswordItem.js
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PasswordItem = ({
  item,
  index,
  onDelete,
  getGroupName,
  getGroupColor,
  getGroupIcon,
}) => {
  const firstIcon =
    String(getGroupIcon(item.group)).match(/\p{Extended_Pictographic}/u)?.[0] ||
    getGroupIcon(item.group) ||
    "";
  const [showPassword, setShowPassword] = useState(false);
  const itemAnim = useRef(new Animated.Value(0)).current;
  const scaleItemAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleItemAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Removed the incorrect auto-selection logic that was here

  const handleDelete = () => {
    Alert.alert(
      "Delete Password",
      "Are you sure you want to delete this password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(item._id),
        },
      ]
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Animated.View
      style={[
        styles.passwordItem,
        {
          opacity: itemAnim,
          transform: [
            { scale: scaleItemAnim },
            {
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.passwordHeader}>
        <View style={styles.passwordTitleContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getGroupColor(item.group) },
            ]}
          >
            <Text style={styles.iconText}>{firstIcon}</Text>
          </View>
          <View style={styles.passwordInfo}>
            <Text style={styles.passwordTitle}>{item.title}</Text>
            <Text style={styles.groupLabel}>
              {item.group && getGroupName(item.group)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.passwordDetails}>
        {item.username ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👤 Username:</Text>
            <Text style={styles.detailValue}>{item.username}</Text>
          </View>
        ) : null}

        {item.website ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🌐 Website:</Text>
            <Text style={styles.detailValue}>{item.website}</Text>
          </View>
        ) : null}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🔒 Password:</Text>
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.passwordToggle}
          >
            <Text style={styles.detailValue}>
              {showPassword ? item.password : "🙈".repeat(10)}
            </Text>
            <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {item.notes ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📝 Notes:</Text>
            <Text style={styles.detailValue}>{item.notes}</Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  passwordItem: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  passwordTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  passwordInfo: {
    flex: 1,
  },
  passwordTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  groupLabel: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  passwordDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  passwordToggle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eyeIcon: {
    marginLeft: 10,
    fontSize: 16,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PasswordItem;
