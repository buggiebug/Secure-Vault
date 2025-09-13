// components/FloatingActionButton.js
import { useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

const FloatingActionButton = ({ onPress, icon, style, fabAnim }) => {
  const fabScale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[
      styles.fab,
      style,
      { 
        transform: [
          { scale: fabScale },
          { 
            rotate: fabAnim ? fabAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '5deg']
            }) : '0deg'
          }
        ] 
      }
    ]}>
      <TouchableOpacity onPress={handlePress} style={styles.fabButton}>
        <Text style={styles.fabIcon}>{icon}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FloatingActionButton;