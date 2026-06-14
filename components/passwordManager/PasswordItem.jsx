// components/PasswordItem.js
import { Link } from "expo-router";
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
  openEditModal,
}) => {
  const firstIcon =
    String(getGroupIcon(item.group)).match(/\p{Extended_Pictographic}/u)?.[0] ||
    getGroupIcon(item.group) ||
    "";
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordNotes, setShowPasswordNotes] = useState(false);
  const itemAnim = useRef(new Animated.Value(0)).current;
  const scaleItemAnim = useRef(new Animated.Value(0.8)).current;

  // Format last updated time
  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    // Format as date if older than a week
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

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

  const handlePasssword = () => {
    Alert.alert(
      `Manage Password`,
      "Modifying or deleting saved passwords may lead to data loss. Are you sure you want to proceed?",
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(item._id),
        },
        {
          text: "Edit",
          style: "default",
          onPress: () => openEditModal(item),
        },
        { text: "Cancel", style: "cancel", isPreferred: true },
      ]
    );
  };

  // Handle delete with confirmation
  const handleDelete = (itemId) => {
    Alert.alert(
      `Delete Password`,
      "Are you sure you want to delete this password? This action cannot be undone.",
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(itemId),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Toggle password visibility with confirmation
  const togglePasswordVisibility = () => {
    if (showPassword) {
      // Already visible → just hide it
      setShowPassword(false);
      return;
    }

    Alert.alert(
      "View Password",
      "Are you sure you want to view your saved password?",
      [
        {
          text: "Yes",
          onPress: () => setShowPassword(true),
        },
        {
          text: "No",
          style: "cancel",
        },
      ]
    );
  };

  // 
  const togglePasswordNotesVisibility = () => {
    if (showPasswordNotes) {
      // Already visible → just hide it
      setShowPasswordNotes(false);
      return;
    }

    Alert.alert(
      "View Notes",
      "",
      [
        {
          text: "Yes",
          onPress: () => setShowPasswordNotes(true),
        },
        {
          text: "No",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onLongPress={handlePasssword}>
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
        </View>

        <View style={styles.passwordDetails}>
          {item.username ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>👤 Username:</Text>
              <Text style={styles.detailValue}>{item.username}</Text>
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

          {item.website ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🌐 Website:</Text>
              <Link
                href={item.website}
                style={[styles.detailValue, styles.websiteLink]}
                numberOfLines={1}
              >
                {item.website}
              </Link>
            </View>
          ) : null}

          {item.notes ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📝 Notes:</Text>
              <TouchableOpacity
                onPress={togglePasswordNotesVisibility}
                style={styles.passwordToggle}
              >
                <Text style={styles.detailValue}>
                  {showPasswordNotes ? item.notes : "🙈".repeat(10)}
                </Text>
                <Text style={styles.eyeIcon}>{showPasswordNotes ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Last Updated Timestamp */}
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>
            🕐 Updated {formatLastUpdated(item.updatedAt)}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
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
  websiteLink: {
    textDecorationLine: "underline",
    color: "#3b3299a4",
  },
  timestampContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  timestampText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});

export default PasswordItem;
