// OptimizedPasswordManager.js
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';

// Import custom hook
import { usePasswordManager } from './usePasswordManager';

// Import components
import AddGroupModal from './AddGroupModal';
import AddPasswordModal from './AddPasswordModal';
import EmptyState from './EmptyState';
import FloatingActionButton from './FloatingActionButton';
import GroupFilters from './GroupFilter';
import Header from './Header';
import PasswordItem from './PasswordItem';

const OptimizedPasswordManager = () => {
  const {
    passwords,
    groups,
    passwordLoading,
    groupLoading,
    addPassword,
    addGroup,
    deletePassword,
    getFilteredPasswords,
    getGroupName,
    getGroupColor,
    getGroupIcon,
  } = usePasswordManager();

  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateIn();
  }, []);

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

  const handleAddPassword = async (passwordData) => {
    try {
      await addPassword(passwordData);
      // Modal will close itself after successful save
    } catch (error) {
      // Error is already handled in the hook and modal
    }
  };

  const handleAddGroup = async (groupName) => {
    try {
      await addGroup(groupName);
      // Modal will close itself after successful save
    } catch (error) {
      // Error is already handled in the hook and modal
    }
  };

  const filteredPasswords = getFilteredPasswords(selectedGroup);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      
      <Header passwordCount={passwords.length} headerAnim={headerAnim} />

      {/* Group Filters */}
      <GroupFilters
        groups={groups}
        selectedGroup={selectedGroup}
        onGroupSelect={setSelectedGroup}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />

      {/* Password List */}
      <Animated.View style={[
        styles.passwordListContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        <FlatList
          data={filteredPasswords}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <PasswordItem
              item={item}
              index={index}
              onDelete={deletePassword}
              getGroupName={getGroupName}
              getGroupColor={getGroupColor}
              getGroupIcon={getGroupIcon}
            />
          )}
          style={styles.passwordList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState fadeAnim={fadeAnim} />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate item height
            offset: 200 * index,
            index,
          })}
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
        groups={groups}
        loading={passwordLoading}
      />

      <AddGroupModal
        visible={showAddGroup}
        onClose={() => setShowAddGroup(false)}
        onSave={handleAddGroup}
        loading={groupLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
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
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
});

export default OptimizedPasswordManager;