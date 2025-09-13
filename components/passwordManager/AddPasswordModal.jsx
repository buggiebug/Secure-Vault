import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const AddPasswordModal = ({
  visible,
  onClose,
  onSave,
  groups,
  loading = false,
}) => {
  const [passwordData, setPasswordData] = useState({
    title: "",
    username: "",
    password: "",
    website: "",
    notes: "",
    groupId: "",
  });

  // Auto-select Individual category when groups are available
  useEffect(() => {
    if (groups && groups.length > 0 && !passwordData.groupId) {
      const individualGroup = groups.find((g) => g.name === "Individual");
      if (individualGroup) {
        setPasswordData((prev) => ({
          ...prev,
          groupId: individualGroup._id,
        }));
      }
    }
  }, [groups, passwordData.groupId]);

  const handleSave = async () => {
    if (!passwordData.title.trim() || !passwordData.password.trim()) {
      Alert.alert("Error", "Title and password are required");
      return;
    }

    try {
      await onSave(passwordData);
      handleClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save password. Please try again.");
    }
  };

  const handleClose = () => {
    // Find Individual group for reset
    const individualGroup = groups?.find((g) => g.name === "Individual");

    setPasswordData({
      title: "",
      username: "",
      password: "",
      website: "",
      notes: "",
      groupId: individualGroup?._id || "",
    });
    onClose();
  };

  // Filter out "All" group from dropdown options since it's not a real category
  const availableGroups = groups?.filter((group) => group.name !== "All") || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        {/* HEADER */}
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Add New Password</Text>
            <Text style={styles.modalSubtitle}>Secure your digital life</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🏷️ Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Facebook, Gmail, Netflix"
              value={passwordData.title}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, title: text })
              }
              placeholderTextColor="#999"
            />
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>👤 Username/Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              value={passwordData.username}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, username: text })
              }
              placeholderTextColor="#999"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={passwordData.password}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, password: text })
              }
              placeholderTextColor="#999"
            />
          </View>

          {/* CATEGORY DROPDOWN */}
          <Text style={styles.sectionTitle}>📂 Select Category</Text>
          <Dropdown
            style={[
              styles.dropdown,
              passwordData.groupId && styles.selectedDropdown,
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={availableGroups.map((g) => ({
              label: `${g.icon} ${g.name}`,
              value: g._id,
            }))}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select a group"
            searchPlaceholder="Search categories..."
            value={passwordData.groupId}
            onChange={(item) => {
              setPasswordData({ ...passwordData, groupId: item.value });
            }}
          />

          {/* Website */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🌐 Website (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com"
              value={passwordData.website}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, website: text })
              }
              placeholderTextColor="#999"
            />
          </View>

          {/* Notes */}
          <View style={[styles.inputContainer, { marginBottom: 50 }]}>
            <Text style={styles.inputLabel}>📝 Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes..."
              multiline
              value={passwordData.notes}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, notes: text })
              }
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>

        {/* BUTTONS */}
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "⏳ Saving..." : "💾 Save Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  groupSelection: {
    marginBottom: 30,
  },
  groupOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedGroupOption: {
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderRadius: 20,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  groupOptionIcon: {
    fontSize: 18,
    color: "#fff",
  },
  groupOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 10,
    gap: 15,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#6C63FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },

  // Dropdown styles
  dropdown: {
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
  },
  selectedDropdown: {
    // borderColor: "#6C63FF",
    // borderWidth: 2,
    // shadowColor: "#6C63FF",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#999",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: "#333",
  },
});

export default AddPasswordModal;
