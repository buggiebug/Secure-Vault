// components/GroupFilter.js
import { useRef } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const GroupFilter = ({ group, isSelected, onPress, onLongPress }) => {
  const filterAnim = useRef(new Animated.Value(1)).current;

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
    // Don't allow deleting the "All" group
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
            onPress: () => onLongPress(),
          },
        ]
      );
      return;
    }

    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${group.name}"?\nAll passwords in this group will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => onLongPress(), // ✅ call parent delete function
        },
      ]
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: filterAnim }] }}>
      <TouchableOpacity
        style={[
          styles.groupFilter,
          group._id === "all" && styles.allFilter,
          isSelected && [
            styles.selectedGroupFilter,
            { backgroundColor: group._id === "all" ? "#6C63FF" : group.color },
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
            group={group}
            isSelected={selectedGroup === group._id}
            onPress={() => onGroupSelect(group._id)}
            onLongPress={() => handleDeleteGroup(group._id)} // ✅ pass down
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
});

export { GroupFilter };
export default GroupFilters;
