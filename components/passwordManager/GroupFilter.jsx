import { verifyPassword } from "@/redux/slice/authSlice";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import Notify from "../utils/Notify";
import OTPInput from "./OTPInput";

const GroupFilter = ({
  totalGroups,
  group,
  isSelected,
  onPress,
  onLongPress,
}) => {
  const filterAnim = useRef(new Animated.Value(1)).current;
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(filterAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const handleLongPress = () => {
    // Don’t allow deleting the "All" group
    if (group._id === "all") return;

    if (["individual", "financial", "social", "mail"].includes(group._id)) {
      Alert.alert(
        "Delete Group",
        `This is a default group (${group.name}). It will come back when you reopen the app, but the passwords inside will be removed.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Delete",
            style: "destructive",
            onPress: () => setShowModal(true), // 🔑 Show password modal
          },
        ]
      );
      return;
    }

    // For non-default groups → directly ask password
    setShowModal(true);
  };

  const confirmDelete = () => {
    if(password.trim().length === 0) {
      Notify("Please enter your PIN to confirm.", 0);
      return;
    }
    if(password.trim().length < 6) {
      Notify("PIN should be at least 6 digits.", 0);
      return;
    }
    dispatch(verifyPassword({ password }))
      .unwrap() // ✅ if you're using createAsyncThunk
      .then((res) => {
        // ✅ Backend says password is correct
        // console.log("Password verified:", res);
        if (res.success !== true) {
          Notify(res.message || "Incorrect password. Try again.", 1);
          return;
        }

        if (res.success === true) {
          Notify("Password verified. Deleting group...", 0);
          setShowModal(false);
          setPassword("");
          onLongPress();
        }
      })
      .catch((err) => {
        // ❌ Wrong password or API error
        console.log("Password check failed:", err);
        Notify("Incorrect password. Try again.", 1);
      });
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale: filterAnim }] }}>
        <TouchableOpacity
          style={[
            styles.groupFilter,
            group._id === "all" && styles.allFilter,
            isSelected && [
              styles.selectedGroupFilter,
              {
                backgroundColor: group._id === "all" ? "#6C63FF" : group.color,
              },
            ],
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress} // ✅ attach long press
        >
          <Text style={styles.groupIcon}>{group.icon}</Text>
          <Text
            style={[
              styles.groupFilterText,
              isSelected && styles.selectedGroupFilterText,
            ]}
          >
            {group.name}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Password confirmation modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {/* Warning Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.warningIcon}>🗑️</Text>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Delete Group?</Text>
            
            {/* Description */}
            <Text style={styles.modalDesc}>
              You're about to delete <Text style={styles.groupNameHighlight}>"{group.name}"</Text> which contains{" "}
              <Text style={styles.passwordCountHighlight}>{totalGroups.length || 0} password{totalGroups.length !== 1 ? 's' : ''}</Text>.
            </Text>

            <View style={styles.warningBox}>
              <Text style={styles.warningEmoji}>⚠️</Text>
              <Text style={styles.warningText}>
                All passwords in this group will be permanently deleted. This action cannot be undone.
              </Text>
            </View>

            {/* PIN Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>🔐 Enter your PIN to confirm</Text>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
              <OTPInput
                length={6}
                value={password}
                onComplete={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowModal(false);
                  setPassword("");
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={confirmDelete}
              >
                <Text style={styles.deleteText}>🗑️ Delete Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const GroupFilters = ({
  groups,
  selectedGroup,
  onGroupSelect,
  fadeAnim,
  slideAnim,
  handleDeleteGroup,
  refreshing
}) => {


  useEffect(()=>{

  },[refreshing])


  return (
    <Animated.View
      style={[
        styles.groupFiltersContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupFiltersContent}
      >
        {groups.map((group) => (
          <GroupFilter
            key={group._id}
            totalGroups={groups}
            group={group}
            isSelected={selectedGroup === group._id}
            onPress={() => onGroupSelect(group._id)}
            onLongPress={() => handleDeleteGroup(group._id)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  groupFiltersContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  groupFiltersContent: {
    paddingHorizontal: 15,
  },
  groupFilter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    minWidth: 100,
  },
  selectedGroupFilter: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  allFilter: {
    backgroundColor: "#f0f0f0",
  },
  groupIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  groupFilterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  selectedGroupFilterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // 🔑 Modal styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 56,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  groupNameHighlight: {
    fontWeight: "bold",
    color: "#6C63FF",
  },
  passwordCountHighlight: {
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFF3CD",
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  warningEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#856404",
    lineHeight: 18,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  eyeIcon: {
    fontSize: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export { GroupFilter };
export default GroupFilters;
