import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function DataPrivacyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron-left" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Data & Privacy</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.iconContainer}>
                    <View style={styles.shieldBackground}>
                        <IconSymbol name="shield" size={60} color="#6C63FF" />
                    </View>
                </View>

                <Text style={styles.title}>Your Privacy Matters</Text>
                
                <Text style={styles.description}>
                    At SecureVault, we take your privacy and security seriously. We believe that your data belongs to you, and no one else.
                </Text>

                <View style={styles.featureBox}>
                    <View style={styles.featureIcon}>
                        <IconSymbol name="lock" size={24} color="#fff" />
                    </View>
                    <View style={styles.featureTextContainer}>
                        <Text style={styles.featureTitle}>End-to-End Encrypted</Text>
                        <Text style={styles.featureDescription}>
                            Your data is encrypted on your device before it ever reaches our servers. Only you hold the keys to access your sensitive information.
                        </Text>
                    </View>
                </View>

                <View style={styles.featureBox}>
                    <View style={styles.featureIcon}>
                        <IconSymbol name="block" size={24} color="#fff" />
                    </View>
                    <View style={styles.featureTextContainer}>
                        <Text style={styles.featureTitle}>Zero Data Selling</Text>
                        <Text style={styles.featureDescription}>
                            We do not use, track, or sell your personal data to advertisers or third parties. Your vault is completely private.
                        </Text>
                    </View>
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        width: 38, // Balance the back button
    },
    container: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    shieldBackground: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EAE9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e1e1e',
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    featureBox: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        width: '100%',
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});
