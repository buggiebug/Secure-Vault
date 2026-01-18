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
    Image,
    Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import {
    updateUserProfile,
    logoutUser,
    deleteUser,
} from "../../redux/slice/authSlice";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const Profile = () => {
    const dispatch = useDispatch();
    const { userData, loadingStatus, loadingModal } = useSelector(
        (state) => state.auth
    );

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: userData?.name || "",
        email: userData?.email || "",
        mobile: userData?.mobile || "",
        gender: userData?.gender || "Not Specified",
    });

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdate = () => {
        dispatch(
            updateUserProfile({
                userData: formData,
                message: "Profile updated successfully",
            })
        ).then((res) => {
            if (res?.meta?.requestStatus === "fulfilled") {
                setIsEditing(false);
            }
        });
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => dispatch(logoutUser()),
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This action cannot be undone. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => dispatch(deleteUser()),
                },
            ]
        );
    };

    const InputField = ({ label, value, onChangeText, editable, keyboardType, placeholder }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, !editable && styles.disabledInputContainer]}>
                <TextInput
                    style={[styles.input, !editable && styles.disabledInput]}
                    value={value}
                    onChangeText={onChangeText}
                    editable={editable}
                    placeholder={placeholder}
                    placeholderTextColor="#666"
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <LinearGradient
                colors={['#0f0c29', '#302b63', '#24243e']}
                style={StyleSheet.absoluteFillObject}
            />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.avatarWrapper}>
                        <LinearGradient
                            colors={['#00d2ff', '#3a7bd5']}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>
                                {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
                            </Text>
                        </LinearGradient>
                        <TouchableOpacity style={styles.cameraButton}>
                            <IconSymbol name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerTitle}>{userData?.name || "User"}</Text>
                    <Text style={styles.headerSubtitle}>{userData?.email}</Text>
                </View>

                <View style={styles.formContainer}>
                    <InputField
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(text) => handleChange("name", text)}
                        editable={isEditing}
                        placeholder="Your Name"
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
                        editable={isEditing}
                        keyboardType="phone-pad"
                        placeholder="Mobile Number"
                    />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={[styles.inputContainer, styles.pickerWrapper, !isEditing && styles.disabledInputContainer]}>
                            {isEditing ? (
                                <Picker
                                    selectedValue={formData.gender}
                                    onValueChange={(itemValue) => handleChange("gender", itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#fff"
                                    itemStyle={{ color: '#fff' }}
                                >
                                    <Picker.Item label="Select Gender" value="" color="#000" />
                                    <Picker.Item label="Male" value="Male" color="#000" />
                                    <Picker.Item label="Female" value="Female" color="#000" />
                                    <Picker.Item label="Other" value="Other" color="#000" />
                                </Picker>
                            ) : (
                                <TextInput
                                    style={[styles.input, styles.disabledInput]}
                                    value={formData.gender}
                                    editable={false}
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        {isEditing ? (
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => {
                                        setFormData({
                                            name: userData?.name || "",
                                            email: userData?.email || "",
                                            mobile: userData?.mobile || "",
                                            gender: userData?.gender || "Not Specified",
                                        });
                                        setIsEditing(false);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton]}
                                    onPress={handleUpdate}
                                    disabled={loadingStatus === "loading" && loadingModal === "updateUserProfile"}
                                >
                                    {loadingStatus === "loading" && loadingModal === "updateUserProfile" ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <LinearGradient
                                            colors={['#00d2ff', '#3a7bd5']}
                                            style={StyleSheet.absoluteFillObject}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        />
                                    )}
                                    {loadingStatus !== "loading" && <Text style={styles.buttonText}>Save Changes</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.buttonWrapper}
                                onPress={() => setIsEditing(true)}
                            >
                                <LinearGradient
                                    colors={['#434343', '#000000']} // Elegant dark gradient
                                    style={[styles.button, styles.editButton]}
                                >
                                    <Text style={styles.buttonText}>Edit Profile</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.dangerZone}>
                    <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={handleLogout}
                    >
                        <LinearGradient
                            colors={['#F2994A', '#F2C94C']}
                            style={[styles.button]}
                        >
                            <Text style={[styles.buttonText, { color: '#000' }]}>Logout</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={handleDeleteAccount}
                    >
                        <View style={[styles.button, styles.deleteButton]}>
                            <Text style={[styles.buttonText, { color: "#ff4444" }]}>
                                Delete Account
                            </Text>
                        </View>
                    </TouchableOpacity> */}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
        marginTop: 40,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        marginBottom: 15,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    avatarGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#333',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.7)",
    },
    formContainer: {
        marginBottom: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: "rgba(255,255,255,0.8)",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    input: {
        padding: 15,
        color: "#fff",
        fontSize: 16,
    },
    disabledInputContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'rgba(255,255,255,0.05)',
    },
    disabledInput: {
        color: "rgba(255,255,255,0.5)",
    },
    pickerWrapper: {
        height: Platform.OS === 'android' ? 50 : 'auto',
        justifyContent: 'center',
    },
    picker: {
        color: "#fff",
        // backgroundColor: "transparent",
    },
    actionButtons: {
        marginTop: 10,
    },
    editActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 15,
    },
    buttonWrapper: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: 'row',
    },
    editButton: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    saveButton: {
        backgroundColor: "#007bff", // Fallback
        flex: 1,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: "rgba(255,255,255,0.1)",
        flex: 1,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    dangerZone: {
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
        paddingTop: 25,
    },
    deleteButton: {
        backgroundColor: "rgba(255, 68, 68, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(255, 68, 68, 0.3)",
    },
});

export default Profile;
