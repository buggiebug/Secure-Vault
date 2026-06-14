// components/Header.js

import React from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({
  passwordCount,
  headerAnim,
  syncStatus,
  lastSyncedAt,
  onSync,
  isSyncing,
}) => {
  const getSyncIcon = () => {
    if (isSyncing) return <ActivityIndicator size="small" color="#FFFFFF" />;
    switch (syncStatus) {
      case 'success': return <Ionicons name="cloud-done" size={16} color="#00C851" />;
      case 'error': return <Ionicons name="cloud-offline" size={16} color="#FF6B6B" />;
      default: return <Ionicons name="cloud-outline" size={16} color="#FFFFFF" />;
    }
  };

  const getLastSyncText = () => {
    if (!lastSyncedAt) return 'Not synced';
    const diff = Date.now() - lastSyncedAt;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Animated.View
      style={[
        styles.header,
        {
          transform: [{ translateY: headerAnim }],
        },
      ]}
    >
      {/* Decorative circles */}
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerIcon}>🔐</Text>
            <Text style={styles.headerTitle}>SecureVault</Text>
          </View>

          <TouchableOpacity
            style={styles.syncBtn}
            onPress={onSync}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            {getSyncIcon()}
            <Text style={styles.syncText}>{getLastSyncText()}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Your encrypted vault for passwords and sensitive data.
        </Text>
      </View>

      <View style={styles.headerStats}>
        {passwordCount.selectedGroupName === 'All' ? (
          <Text style={styles.statsText}>
            🔑 {passwordCount.total} Passwords Stored
          </Text>
        ) : (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              📂 {passwordCount.filtered} in {passwordCount.selectedGroupName}
            </Text>
            <Text style={styles.statsSubText}>
              {passwordCount.total} Total Passwords
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6C63FF',
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 24,
    paddingHorizontal: 20,

    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,

    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },

  // Decorations
  decor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -55,
    right: -45,
  },
  decor2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -35,
    left: -20,
  },

  headerContent: {
    marginBottom: 18,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    fontSize: 28,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    marginLeft: 2,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    fontWeight: '400',
  },

  headerStats: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  statsContainer: {
    alignItems: 'flex-start',
  },

  statsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  statsSubText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2,
  },

  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 5,
  },

  syncText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default Header;