// components/Header.js
import { useEffect } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const Header = ({ passwordCount, headerAnim }) => {
  useEffect(() => {
    // This effect will run when passwordCount changes
    console.log('Password count updated:', passwordCount);
  }, [passwordCount]);

  return (
    <Animated.View style={[
      styles.header,
      { transform: [{ translateY: headerAnim }] }
    ]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>🔐 SecureVault</Text>
        <Text style={styles.headerSubtitle}>Keep your passwords safe</Text>
      </View>
      <View style={styles.headerStats}>
        {passwordCount.selectedGroupName === "All" ? (
          <Text style={styles.statsText}>
            {passwordCount.total} passwords
          </Text>
        ) : (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {passwordCount.filtered} in {passwordCount.selectedGroupName}
            </Text>
            <Text style={styles.statsSubText}>
              {passwordCount.total} total
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8E6FF',
    opacity: 0.9,
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '500',
  },
  statsSubText: {
    color: '#E8E6FF',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});

export default Header;