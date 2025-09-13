// components/AddGroupModal.js
import { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AddGroupModal = ({ visible, onClose, onSave, loading = "loading" }) => {
  const [groupName, setGroupName] = useState("");
  const [groupIcon, setGroupIcon] = useState("");

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Group name is required");
      return;
    }

    const colors = [
      "#FF6B35",
      "#F7931E",
      "#FFD23F",
      "#06FFA5",
      "#118AB2",
      "#073B4C",
    ];
    const categoryAdd = {
      name: groupName.trim(),
      icon: groupIcon.trim() || "📁",
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    try {
      await onSave(categoryAdd);
      handleClose();
    } catch (error) {
      Alert.alert("Error", "Failed to create group. Please try again.");
    }
  };

  const handleClose = () => {
    // Clear form data when modal closes (whether saved or cancelled)
    setGroupName("");
    setGroupIcon("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Create New Group</Text>
            <Text style={styles.modalSubtitle}>Organize your passwords</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📁 Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Work, Gaming, Personal"
              value={groupName}
              onChangeText={setGroupName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📁 Group Icon</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 🏢, 🎮, 🏠"
              value={groupIcon}
              onChangeText={setGroupIcon}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>
                {groupIcon.trim() + " " + groupName.trim() ||
                  "Your group name will appear here"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading === "loading" && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading === "loading" ? true : false}
          >
            <Text style={styles.saveButtonText}>
              {loading === "loading" ? "⏳ Creating..." : "🎉 Create Group"}
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
  previewSection: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  previewContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
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
  disabledButton: {
    backgroundColor: "#ccc",
    shadowOpacity: 0.1,
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
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AddGroupModal;
