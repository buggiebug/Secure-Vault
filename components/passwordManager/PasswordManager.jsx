/* eslint-disable react-hooks/exhaustive-deps */
// PasswordManager.js
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

// Import API service

import { selectPasswordDetails } from "@/redux/reselect/reselectData";
import {
  addGroup,
  addPassword,
  deleteGroup,
  deletePassword,
} from "@/redux/slice/passwordManagerSlice";
import { useDispatch, useSelector } from "react-redux";
import AddGroupModal from "./AddGroupModal";
import AddPasswordModal from "./AddPasswordModal";
import EmptyState from "./EmptyState";
import FloatingActionButton from "./FloatingActionButton";
import GroupFilters from "./GroupFilter";
import Header from "./Header";
import PasswordItem from "./PasswordItem";

const PasswordManager = () => {
  const { groupsData, passwordsData, loadingStatus } = useSelector(
    selectPasswordDetails
  );
  const dispatch = useDispatch();

  const [passwords, setPasswords] = useState([]);
  const defaultGroups = [
    { _id: "all", name: "All", color: "#6C63FF", icon: "📂" },
    { _id: "individual", name: "Individual", color: "#666666", icon: "🙈" },
    { _id: "financial", name: "Financial", color: "#00C851", icon: "💳" },
    { _id: "social", name: "Social Media", color: "#4267B2", icon: "📱" },
    { _id: "mail", name: "Mail", color: "#aa66cc", icon: "📧" },
  ];
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    setGroups(defaultGroups);
  }, []);

  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("all");

  // Simplified password count state
  const [passwordCount, setPasswordCount] = useState({
    total: 0,
    filtered: 0,
    selectedGroupName: "All",
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateIn();
  }, []);

  useEffect(() => {
    if (groupsData && groupsData.length > 0) {
      // Only add user-created groups from API (excluding default groups)
      const userGroups = groupsData.filter(
        (group) =>
          !["all", "individual", "financial", "social", "mail"].includes(
            group._id
          )
      );
      setGroups((prevGroups) => {
        // Merge with default groups, avoiding duplicates
        const existingIds = prevGroups.map((g) => g._id);
        const newGroups = userGroups.filter(
          (g) => !existingIds.includes(g._id)
        );
        return [...prevGroups, ...newGroups];
      });
    }
    if (passwordsData && passwordsData.length > 0) {
      setPasswords(passwordsData);
    }
  }, [groupsData, passwordsData]);

  // Update password count whenever passwords or selectedGroup changes
  useEffect(() => {
    const total = passwords.length;
    let filtered = total;
    let selectedGroupName = "All";

    if (selectedGroup !== "all") {
      filtered = passwords.filter(
        (password) => password.group === selectedGroup
      ).length;

      const group = groups.find((g) => g._id === selectedGroup);
      selectedGroupName = group ? group.name : "Unknown";
    }

    setPasswordCount({
      total,
      filtered,
      selectedGroupName,
    });
  }, [passwords, selectedGroup, groups]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // FAB bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleAddGroup = async (groupData) => {
    dispatch(addGroup(groupData));
    // setGroups((prev) => [...prev, response.group]);
  };
  const handleDeleteGroup = async (groupId) => {
    dispatch(deleteGroup(groupId));
    setGroups((prev) => prev.filter((p) => p._id !== groupId));
    setPasswords((prev) => prev.filter((p) => p.group !== groupId));
    setSelectedGroup("all");
  };

  const handleAddPassword = async (passwordData) => {
    // console.log(passwordData);
    // Ensure Individual group is selected if no group is specified
    const groupId = passwordData.groupId || "individual";
    passwordData.groupId = groupId;
    dispatch(addPassword(passwordData));
    // setPasswords((prev) => [...prev, response.password]);
  };

  const handleDeletePassword = async (id) => {
    try {
      // await passwordAPI.deletePassword(id);
      setPasswords((prev) => prev.filter((p) => p._id !== id));
      dispatch(deletePassword(id));
    } catch (error) {
      console.error("Error deleting password:", error);
      Alert.alert("Error", "Failed to delete password. Please try again.");
    }
  };

  const getFilteredPasswords = () => {
    if (selectedGroup === "all") {
      return passwords;
    }
    // Filter passwords by groupId
    return passwords.filter((password) => password.group === selectedGroup);
  };

  const getGroupName = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    return group ? group.name : "Unknown";
  };

  const getGroupColor = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    return group ? group.color : "#666666";
  };

  const getGroupIcon = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    return group ? group.icon : "📁";
  };

  // Filter groups to show only available groups (excluding "All" from the list)
  const getAvailableGroups = () => {
    return groups.filter((group) => group._id !== "all");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />

      <Header passwordCount={passwordCount} headerAnim={headerAnim} />

      {/* Group Filters */}
      <GroupFilters
        groups={groups}
        selectedGroup={selectedGroup}
        onGroupSelect={setSelectedGroup}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        handleDeleteGroup={handleDeleteGroup}
      />

      {/* Password List */}
      <Animated.View
        style={[
          styles.passwordListContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <FlatList
          data={getFilteredPasswords()}
          keyExtractor={(item) => item.id || item._id}
          renderItem={({ item, index }) => (
            <PasswordItem
              item={item}
              index={index}
              onDelete={handleDeletePassword}
              getGroupName={getGroupName}
              getGroupColor={getGroupColor}
              getGroupIcon={getGroupIcon}
            />
          )}
          style={styles.passwordList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState fadeAnim={fadeAnim} />}
        />
      </Animated.View>

      {/* Floating Action Buttons */}
      <FloatingActionButton
        onPress={() => setShowAddPassword(true)}
        icon="+"
        style={styles.mainFab}
        fabAnim={fabAnim}
      />

      <FloatingActionButton
        onPress={() => setShowAddGroup(true)}
        icon="📁"
        style={styles.secondaryFab}
        fabAnim={fabAnim}
      />

      {/* Modals */}
      <AddPasswordModal
        visible={showAddPassword}
        onClose={() => setShowAddPassword(false)}
        onSave={handleAddPassword}
        groups={getAvailableGroups()}
        loading={loadingStatus}
        defaultGroups={defaultGroups}
      />

      <AddGroupModal
        visible={showAddGroup}
        onClose={() => setShowAddGroup(false)}
        onSave={handleAddGroup}
        loading={loadingStatus}
        groups={groups}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  passwordListContainer: {
    flex: 1,
    marginTop: 20,
  },
  passwordList: {
    paddingHorizontal: 20,
  },
  mainFab: {
    bottom: 30,
    right: 30,
  },
  secondaryFab: {
    bottom: 100,
    right: 30,
    backgroundColor: "#FF6B6B",
    shadowColor: "#FF6B6B",
  },
});

export default PasswordManager;
