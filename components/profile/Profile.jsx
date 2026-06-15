import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Switch,
    Platform,
    Modal,
    KeyboardAvoidingView,
    Image
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import {
    updateUserProfile,
    updateUserPin,
    logoutUser,
} from "../../redux/slice/authSlice";
import { IconSymbol } from "@/components/ui/icon-symbol";
import GetImage from "../utils/GetImage";

const MenuItem = ({ icon, title, onPress, iconBg, iconColor = "#555", isDanger = false, customIcon }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={[styles.menuIconWrapper, iconBg && { backgroundColor: iconBg }]}>
            {customIcon ? customIcon : <IconSymbol name={icon} size={24} color={isDanger ? '#ff4a4a' : iconColor} />}
        </View>
        <Text style={[styles.menuItemText, isDanger && { color: '#ff4a4a' }]}>{title}</Text>
    </TouchableOpacity>
);

const ModalWrapper = ({ visible, title, children, setActiveModal, handleUpdate, loadingStatus, loadingModal }) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeButton}>
                        <IconSymbol name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                    {children}
                </ScrollView>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdate}
                    disabled={loadingStatus === "loading" && loadingModal === "updateUserProfile"}
                >
                    {loadingStatus === "loading" && loadingModal === "updateUserProfile" ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </Modal>
);

const InputField = ({ label, value, onChangeText, editable = true, keyboardType }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputContainer, !editable && styles.disabledInputContainer]}>
            <TextInput
                style={[styles.input, !editable && styles.disabledInput]}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                keyboardType={keyboardType}
                placeholderTextColor="#999"
            />
        </View>
    </View>
);

const Profile = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { userData, loadingStatus, loadingModal } = useSelector(
        (state) => state.auth
    );
    const unreadCount = useSelector((state) => state.notifications.unreadCount);

    const [activeModal, setActiveModal] = useState(null); // 'personal', 'settings', 'preferences', 'updatePin'

    const [pinData, setPinData] = useState({
        oldPin: "",
        newPin: "",
        confirmPin: ""
    });

    // Form state matching schema
    const [formData, setFormData] = useState({
        name: userData?.name || "",
        email: userData?.email || "",
        mobile: userData?.mobile || "",
        gender: userData?.gender || "",
        settings: {
            theme: userData?.settings?.theme || "light",
            notifications: userData?.settings?.notifications ?? true,
            language: userData?.settings?.language || "en",
            preferences: {
                fontSize: userData?.settings?.preferences?.fontSize || "medium",
                autoSave: userData?.settings?.preferences?.autoSave ?? true
            }
        }
    });

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSettingChange = (settingName, value) => {
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                [settingName]: value
            }
        });
    };

    const handlePreferenceChange = (prefName, value) => {
        setFormData({
            ...formData,
            settings: {
                ...formData.settings,
                preferences: {
                    ...formData.settings.preferences,
                    [prefName]: value
                }
            }
        });
    };

    const handleUpdate = () => {
        dispatch(
            updateUserProfile({
                userData: formData,
                message: "Profile updated successfully",
            })
        ).then((res) => {
            if (res?.meta?.requestStatus === "fulfilled") {
                setActiveModal(null);
            }
        });
    };

    const handlePinUpdate = () => {
        if (pinData.newPin !== pinData.confirmPin) {
            Alert.alert("Error", "New PIN and Confirm PIN do not match");
            return;
        }
        dispatch(
            updateUserPin({
                oldPin: pinData.oldPin,
                newPin: pinData.newPin
            })
        ).then((res) => {
            if (res?.meta?.requestStatus === "fulfilled") {
                setActiveModal(null);
                setPinData({ oldPin: "", newPin: "", confirmPin: "" });
            }
        });
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        console.log('Signout Triggered')
                        await dispatch(logoutUser()).unwrap();
                    } catch (error) {
                        console.error("Logout failed:", error);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.mainContainer}>
            {/* Curved Header Background */}
            <View style={styles.headerBackgroundWrapper}>
                <View style={styles.headerBackground} />
            </View>

            {/* Header Top Bar */}
            <View style={styles.headerTopBar}>
                <TouchableOpacity>
                    <IconSymbol name="chevron-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.bellIconWrapper} onPress={() => router.push('/notifications')}>
                    <IconSymbol name="notifications" size={24} color="#fff" />
                    {unreadCount > 0 && (
                        <View style={styles.notificationDot}>
                            <Text style={styles.notificationDotText}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarImageWrapper}>
                        {userData?.gender ? (GetImage(userData?.gender, styles.avatarImage, "")) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.userName}>{userData?.name || "User Name"}</Text>
                    <Text style={styles.userHandle}>@{userData?.email?.toLowerCase().split('@')[0] || "user"}</Text>
                </View>

                {/* Menu List */}
                <View style={styles.menuList}>
                    <MenuItem
                        icon="diamond"
                        title="Invite Friends"
                        iconBg="#EAE9FF"
                        iconColor="#6C63FF"
                        onPress={() => Alert.alert("Invite", "Share link copied!")}
                    />

                    <View style={styles.divider} />

                    <MenuItem
                        icon="person"
                        title="Personal profile"
                        onPress={() => setActiveModal('personal')}
                    />
                    <MenuItem
                        icon="lock"
                        title="Update PIN"
                        onPress={() => setActiveModal('updatePin')}
                    />
                    {/* <MenuItem
                        icon="settings"
                        title="App settings"
                        onPress={() => setActiveModal('settings')}
                    />
                    <MenuItem
                        icon="tune"
                        title="Preferences"
                        onPress={() => setActiveModal('preferences')}
                    />
                    <MenuItem
                        icon="mail"
                        title="Message center"
                        onPress={() => Alert.alert("Messages", "No new messages")}
                    /> */}
                    <MenuItem
                        icon="shield"
                        title="Data and privacy"
                        onPress={() => router.push('/data_privacy')}
                    />
                    <MenuItem
                        icon="logout"
                        title="Sign Out"
                        isDanger={true}
                        onPress={handleLogout}
                    />
                </View>
            </ScrollView>

            {/* Modals for Updating */}
            <ModalWrapper visible={activeModal === 'personal'} title="Personal Profile" setActiveModal={setActiveModal} handleUpdate={handleUpdate} loadingStatus={loadingStatus} loadingModal={loadingModal}>
                <InputField
                    label="Full Name"
                    value={formData.name}
                    onChangeText={(text) => handleChange("name", text)}
                />
                <InputField
                    label="Email Address"
                    value={formData.email}
                    editable={false}
                />
                <InputField
                    label="Mobile Number"
                    value={formData.mobile}
                    onChangeText={(text) => handleChange("mobile", text)}
                    keyboardType="phone-pad"
                />

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={formData.gender}
                            onValueChange={(val) => handleChange("gender", val)}
                        >
                            <Picker.Item label="Not Specified" value="" />
                            <Picker.Item label="Male" value="Male" />
                            <Picker.Item label="Female" value="Female" />
                        </Picker>
                    </View>
                </View>
            </ModalWrapper>

            <ModalWrapper visible={activeModal === 'updatePin'} title="Update PIN" setActiveModal={setActiveModal} handleUpdate={handlePinUpdate} loadingStatus={loadingStatus} loadingModal={loadingModal}>
                <InputField
                    label="Current PIN"
                    value={pinData.oldPin}
                    onChangeText={(text) => setPinData({ ...pinData, oldPin: text })}
                    keyboardType="number-pad"
                />
                <InputField
                    label="New PIN"
                    value={pinData.newPin}
                    onChangeText={(text) => setPinData({ ...pinData, newPin: text })}
                    keyboardType="number-pad"
                />
                <InputField
                    label="Confirm New PIN"
                    value={pinData.confirmPin}
                    onChangeText={(text) => setPinData({ ...pinData, confirmPin: text })}
                    keyboardType="number-pad"
                />
            </ModalWrapper>

            <ModalWrapper visible={activeModal === 'settings'} title="App Settings" setActiveModal={setActiveModal} handleUpdate={handleUpdate} loadingStatus={loadingStatus} loadingModal={loadingModal}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Theme</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={formData.settings.theme}
                            onValueChange={(val) => handleSettingChange("theme", val)}
                        >
                            <Picker.Item label="Light" value="light" />
                            <Picker.Item label="Dark" value="dark" />
                            <Picker.Item label="System" value="system" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Language</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={formData.settings.language}
                            onValueChange={(val) => handleSettingChange("language", val)}
                        >
                            <Picker.Item label="English" value="en" />
                            <Picker.Item label="Spanish" value="es" />
                            <Picker.Item label="French" value="fr" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.label}>Enable Notifications</Text>
                    <Switch
                        value={formData.settings.notifications}
                        onValueChange={(val) => handleSettingChange("notifications", val)}
                        trackColor={{ false: "#ccc", true: "#6C63FF" }}
                        thumbColor="#fff"
                    />
                </View>
            </ModalWrapper>

            <ModalWrapper visible={activeModal === 'preferences'} title="Preferences" setActiveModal={setActiveModal} handleUpdate={handleUpdate} loadingStatus={loadingStatus} loadingModal={loadingModal}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Font Size</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={formData.settings.preferences.fontSize}
                            onValueChange={(val) => handlePreferenceChange("fontSize", val)}
                        >
                            <Picker.Item label="Small" value="small" />
                            <Picker.Item label="Medium" value="medium" />
                            <Picker.Item label="Large" value="large" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.label}>Auto Save Updates</Text>
                    <Switch
                        value={formData.settings.preferences.autoSave}
                        onValueChange={(val) => handlePreferenceChange("autoSave", val)}
                        trackColor={{ false: "#ccc", true: "#6C63FF" }}
                        thumbColor="#fff"
                    />
                </View>
            </ModalWrapper>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    // Curved Header
    headerBackgroundWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 250,
        overflow: 'hidden',
    },
    headerBackground: {
        position: 'absolute',
        top: -100, // Move it up to create the curve at the bottom
        left: -100,
        right: -100,
        height: 350,
        backgroundColor: '#6C63FF', // Blue color matching default theme
        borderRadius: 250,
        transform: [{ scaleX: 1.5 }], // Flattens the curve slightly
    },
    headerTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    bellIconWrapper: {
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        backgroundColor: '#ffb347',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#6C63FF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 80, // Space for the header
    },
    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
        zIndex: 10,
    },
    avatarImageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        padding: 5, // White border effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 15,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e1e1e',
        marginBottom: 5,
    },
    userHandle: {
        fontSize: 15,
        color: '#6C63FF',
        fontWeight: '500',
    },
    // Menu List
    menuList: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e1e1e',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
        marginVertical: 5,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e1e1e',
    },
    closeButton: {
        padding: 5,
    },
    modalBody: {
        marginBottom: 20,
    },
    // Form Inputs in Modal
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    input: {
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    disabledInputContainer: {
        backgroundColor: '#eef0f2',
    },
    disabledInput: {
        color: '#888',
    },
    pickerWrapper: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: '#6C63FF',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Profile;
