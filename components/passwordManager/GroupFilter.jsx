import { verifyPassword } from "@/redux/slice/authSlice";
import { useRef, useState } from "react";
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
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Confirm PIN 😶🙄🤐</Text>
            <Text style={styles.modalDesc}>
              This group {"(" + group.name + ")"} conatins{" "}
              {totalGroups.length || 0} passwords. Are you sure want to delete
              the group if yes enter your PIN to confirm? else cancel.
            </Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Enter your PIN"
              value={password}
              onChangeText={setPassword}
              inputMode="numeric"
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete}>
                <Text style={styles.delete}>Delete Group</Text>
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
}) => {
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalDesc: {
    fontSize: 14,
    fontWeight: "thin",
    marginBottom: 10,
    color: "#C59560",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: "#333",
  },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
  cancel: {
    fontSize: 16,
    marginRight: 20,
    color: "white",
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 15,
  },
  delete: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 15,
  },
});

export { GroupFilter };
export default GroupFilters;
