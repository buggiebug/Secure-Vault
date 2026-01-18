import Profile from '@/components/profile/Profile';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Profile />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});
