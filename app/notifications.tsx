import React, { useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Platform,
    Alert,
    Image,
    Animated,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
} from "@/redux/slice/notificationSlice";

const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

const NotificationItem = ({ item, onPress, onDismiss }) => {
    return (
        <TouchableOpacity
            style={[styles.notifItem, !item.read && styles.unreadItem]}
            onPress={() => onPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.notifContent}>
                <View style={styles.notifLeft}>
                    <View style={[styles.iconCircle, !item.read && styles.iconCircleUnread]}>
                        {item.imageUrl ? (
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.notifImage}
                            />
                        ) : (
                            <IconSymbol
                                name="notifications"
                                size={22}
                                color={!item.read ? "#fff" : "#6C63FF"}
                            />
                        )}
                    </View>
                </View>
                <View style={styles.notifMiddle}>
                    <Text
                        style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text style={styles.notifBody} numberOfLines={2}>
                        {item.body}
                    </Text>
                    <Text style={styles.notifTime}>{getTimeAgo(item.receivedAt)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={() => onDismiss(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol name="close" size={18} color="#999" />
                </TouchableOpacity>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
};

const EmptyNotifications = () => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
            <IconSymbol name="notifications-none" size={64} color="#d1d5db" />
        </View>
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptySubtitle}>
            You're all caught up! We'll notify you when something important happens.
        </Text>
    </View>
);

export default function NotificationsScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector(
        (state) => state.notifications
    );

    const handlePress = useCallback(
        (id) => {
            dispatch(markAsRead(id));
        },
        [dispatch]
    );

    const handleDismiss = useCallback(
        (id) => {
            dispatch(removeNotification(id));
        },
        [dispatch]
    );

    const handleMarkAllRead = useCallback(() => {
        dispatch(markAllAsRead());
    }, [dispatch]);

    const handleClearAll = useCallback(() => {
        Alert.alert(
            "Clear All",
            "Are you sure you want to clear all notifications?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: () => dispatch(clearAllNotifications()),
                },
            ]
        );
    }, [dispatch]);

    const renderItem = useCallback(
        ({ item }) => (
            <NotificationItem
                item={item}
                onPress={handlePress}
                onDismiss={handleDismiss}
            />
        ),
        [handlePress, handleDismiss]
    );

    const keyExtractor = useCallback((item) => item.id, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <IconSymbol name="chevron-left" size={28} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.headerActions}>
                    {notifications.length > 0 && (
                        <TouchableOpacity
                            onPress={handleClearAll}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <IconSymbol name="delete-outline" size={24} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Mark all read bar */}
            {unreadCount > 0 && (
                <TouchableOpacity
                    style={styles.markAllReadBar}
                    onPress={handleMarkAllRead}
                >
                    <IconSymbol name="done-all" size={18} color="#6C63FF" />
                    <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
            )}

            {/* Notification List */}
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={[
                    styles.listContent,
                    notifications.length === 0 && styles.emptyListContent,
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<EmptyNotifications />}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? 44 : 10,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    backButton: {
        padding: 4,
        width: 36,
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: "bold",
        color: "#1e1e1e",
    },
    badge: {
        backgroundColor: "#6C63FF",
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 7,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    headerActions: {
        width: 36,
        alignItems: "flex-end",
    },
    markAllReadBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        backgroundColor: "#EAE9FF",
    },
    markAllReadText: {
        color: "#6C63FF",
        fontSize: 14,
        fontWeight: "600",
    },
    listContent: {
        padding: 16,
    },
    emptyListContent: {
        flex: 1,
        justifyContent: "center",
    },
    separator: {
        height: 10,
    },
    // Notification Item
    notifItem: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
        position: "relative",
    },
    unreadItem: {
        backgroundColor: "#fafaff",
        borderWidth: 1,
        borderColor: "#e8e6ff",
    },
    notifContent: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    notifLeft: {
        marginRight: 12,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#EAE9FF",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    iconCircleUnread: {
        backgroundColor: "#6C63FF",
    },
    notifImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    notifMiddle: {
        flex: 1,
        marginRight: 8,
    },
    notifTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#555",
        marginBottom: 3,
    },
    notifTitleUnread: {
        color: "#1e1e1e",
        fontWeight: "700",
    },
    notifBody: {
        fontSize: 14,
        color: "#777",
        lineHeight: 20,
        marginBottom: 6,
    },
    notifTime: {
        fontSize: 12,
        color: "#aaa",
        fontWeight: "500",
    },
    dismissButton: {
        padding: 4,
        marginTop: 2,
    },
    unreadDot: {
        position: "absolute",
        top: 16,
        left: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#6C63FF",
    },
    // Empty State
    emptyContainer: {
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#f0f0f5",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 15,
        color: "#999",
        textAlign: "center",
        lineHeight: 22,
    },
});
