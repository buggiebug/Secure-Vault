// components/Header.js
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const Header = ({ headerAnim, count }) => {
  return (
    <Animated.View style={[
      styles.header,
      { transform: [{ translateY: headerAnim }] }
    ]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>🪶 My Notes</Text>
        <Text style={styles.headerSubtitle}>Securely capture ideas, voice notes & tasks.</Text>
      </View>
      <View style={styles.headerStats}>
        <Text style={styles.statsText}>
          {count || 0} Notes
        </Text>
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
  statsText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '500',
  },
});

export default Header;