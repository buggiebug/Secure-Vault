import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/ui/icon-symbol"; // Assuming this exists from Profile usage
import { useNetInfo } from "@react-native-community/netinfo";

const { width } = Dimensions.get("window");

const NoInternet = () => {
    const netInfo = useNetInfo();

    const handleRetry = () => {
        // NetInfo updates automatically, but users like a button to press.
        // We can't force a hardware check, but we can visually react.
        console.log("User retrying connection check...");
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f0c29', '#302b63', '#24243e']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <IconSymbol name="wifi.slash" size={80} color="#fff" />
                    {/* Fallback if wifi.slash doesn't exist in IconSymbol mapping, closely check IconSymbol later or use generic error */}
                </View>

                <Text style={styles.title}>No Internet Connection</Text>
                <Text style={styles.message}>
                    Please check your internet settings and try again.
                </Text>

                <TouchableOpacity
                    style={styles.buttonWrapper}
                    onPress={handleRetry}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#00d2ff', '#3a7bd5']}
                        style={styles.button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Optional Debug Info */}
                {/* <Text style={{color: '#555', marginTop: 20}}>
                    Status: {netInfo.isConnected ? 'Connected' : 'Disconnected'}
                </Text> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#000", // Fallback
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        alignItems: "center",
        padding: 40,
        width: "100%",
    },
    iconContainer: {
        marginBottom: 30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: "rgba(255,255,255,0.7)",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 24,
    },
    buttonWrapper: {
        width: "100%",
        maxWidth: 250,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: "#00d2ff",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    button: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
});

export default NoInternet;
