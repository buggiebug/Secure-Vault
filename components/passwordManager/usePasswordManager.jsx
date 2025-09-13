// hooks/usePasswordManager.js
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import passwordAPI from './apiCall';

const DEFAULT_GROUPS = [
  { id: '1', name: 'Social Media', color: '#4267B2', icon: '📱' },
  { id: '2', name: 'Financial', color: '#00C851', icon: '💳' },
  { id: '3', name: 'Fitness', color: '#FF4444', icon: '💪' },
  { id: '4', name: 'Gallery', color: '#AA66CC', icon: '🖼️' },
  { id: '5', name: 'Individual', color: '#666666', icon: '👤' },
];

export const usePasswordManager = () => {
  const [passwords, setPasswords] = useState([]);
  const [groups, setGroups] = useState(DEFAULT_GROUPS);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [passwordsResponse, groupsResponse] = await Promise.all([
        passwordAPI.getPasswords(),
        passwordAPI.getGroups(),
      ]);
      
      if (passwordsResponse?.passwords) {
        setPasswords(passwordsResponse.passwords);
      }
      
      if (groupsResponse?.groups && groupsResponse.groups.length > 0) {
        setGroups(groupsResponse.groups);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new password
  const addPassword = useCallback(async (passwordData) => {
    setPasswordLoading(true);
    try {
      const response = await passwordAPI.createPassword({
        ...passwordData,
        createdAt: new Date().toISOString(),
      });
      
      if (response?.password) {
        setPasswords(prev => [...prev, response.password]);
        return response.password;
      }
    } catch (error) {
      console.error('Error adding password:', error);
      throw new Error('Failed to save password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (id, passwordData) => {
    try {
      const response = await passwordAPI.updatePassword(id, passwordData);
      
      if (response?.password) {
        setPasswords(prev => 
          prev.map(p => p.id === id ? response.password : p)
        );
        return response.password;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password. Please try again.');
    }
  }, []);

  // Delete password
  const deletePassword = useCallback(async (id) => {
    try {
      await passwordAPI.deletePassword(id);
      setPasswords(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting password:', error);
      Alert.alert('Error', 'Failed to delete password. Please try again.');
    }
  }, []);

  // Add new group
  const addGroup = useCallback(async (groupName) => {
    setGroupLoading(true);
    try {
      const colors = ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C'];
      const icons = ['🏢', '🎮', '🏥', '🎨', '📚', '🌟', '🚀', '💼'];
      
      const groupData = {
        name: groupName,
        color: colors[Math.floor(Math.random() * colors.length)],
        icon: icons[Math.floor(Math.random() * icons.length)],
      };

      const response = await passwordAPI.createGroup(groupData);
      
      if (response?.group) {
        setGroups(prev => [...prev, response.group]);
        return response.group;
      }
    } catch (error) {
      console.error('Error adding group:', error);
      throw new Error('Failed to create group. Please try again.');
    } finally {
      setGroupLoading(false);
    }
  }, []);

  // Update group
  const updateGroup = useCallback(async (id, groupData) => {
    try {
      const response = await passwordAPI.updateGroup(id, groupData);
      
      if (response?.group) {
        setGroups(prev => 
          prev.map(g => g.id === id ? response.group : g)
        );
        return response.group;
      }
    } catch (error) {
      console.error('Error updating group:', error);
      throw new Error('Failed to update group. Please try again.');
    }
  }, []);

  // Delete group
  const deleteGroup = useCallback(async (id) => {
    try {
      await passwordAPI.deleteGroup(id);
      setGroups(prev => prev.filter(g => g.id !== id));
      
      // Update passwords that belonged to this group to default group
      setPasswords(prev => 
        prev.map(p => 
          p.groupId === id ? { ...p, groupId: '5' } : p
        )
      );
    } catch (error) {
      console.error('Error deleting group:', error);
      Alert.alert('Error', 'Failed to delete group. Please try again.');
    }
  }, []);

  // Helper functions
  const getFilteredPasswords = useCallback((selectedGroup) => {
    if (selectedGroup === 'all') {
      return passwords;
    }
    return passwords.filter(p => p.groupId === selectedGroup);
  }, [passwords]);

  const getGroupById = useCallback((groupId) => {
    return groups.find(g => g.id === groupId);
  }, [groups]);

  const getGroupName = useCallback((groupId) => {
    const group = getGroupById(groupId);
    return group ? group.name : 'Unknown';
  }, [getGroupById]);

  const getGroupColor = useCallback((groupId) => {
    const group = getGroupById(groupId);
    return group ? group.color : '#666666';
  }, [getGroupById]);

  const getGroupIcon = useCallback((groupId) => {
    const group = getGroupById(groupId);
    return group ? group.icon : '📁';
  }, [getGroupById]);

  // Search passwords
  const searchPasswords = useCallback((query, selectedGroup = 'all') => {
    let filtered = getFilteredPasswords(selectedGroup);
    
    if (!query.trim()) {
      return filtered;
    }
    
    const searchTerm = query.toLowerCase();
    return filtered.filter(password => 
      password.title.toLowerCase().includes(searchTerm) ||
      password.username.toLowerCase().includes(searchTerm) ||
      password.website.toLowerCase().includes(searchTerm) ||
      password.notes.toLowerCase().includes(searchTerm)
    );
  }, [getFilteredPasswords]);

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    passwords,
    groups,
    loading,
    passwordLoading,
    groupLoading,
    
    // Password operations
    addPassword,
    updatePassword,
    deletePassword,
    
    // Group operations
    addGroup,
    updateGroup,
    deleteGroup,
    
    // Helper functions
    getFilteredPasswords,
    getGroupName,
    getGroupColor,
    getGroupIcon,
    searchPasswords,
    
    // Utility
    loadData,
  };
};

export default usePasswordManager;