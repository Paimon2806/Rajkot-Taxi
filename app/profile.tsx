import React, { useState } from "react";
import {
    View,
    Text,
    Switch,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LocationService } from "../services/LocationService";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService"; // FIX: Import logout directly from your service

// TypeScript interface for the OptionRow component's props.
interface OptionRowProps {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
    color?: string;
}

// A Reusable Component for Option Buttons, properly typed.
const OptionRow: React.FC<OptionRowProps> = ({ icon, title, onPress, color = "#333" }) => (
    <TouchableOpacity style={styles.optionButton} onPress={onPress}>
        <View style={{ marginRight: 15 }}>{icon}</View>
        <Text style={[styles.optionText, { color }]}>{title}</Text>
        <Ionicons name="chevron-forward" size={22} color="#ccc" style={styles.optionArrow} />
    </TouchableOpacity>
);


export default function ProfileScreen() {
    const router = useRouter();
    // FIX: Get all user data and the loading state from your AuthContext
    const { user, userName, userRole, isLoading } = useAuth();

    const [isOnline, setIsOnline] = useState(false);

    // FIX: Use the 'isLoading' state from your context for a reliable loading indicator
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </SafeAreaView>
        );
    }

    // After loading, if there's still no user, they might be logged out.
    if (!user) {
        // You can optionally redirect them to the login screen here
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text>Please log in to see your profile.</Text>
            </SafeAreaView>
        )
    }

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "OK",
                onPress: async () => {
                    if(isOnline) {
                        await LocationService.stopLocationTracking();
                    }
                    // FIX: Call the imported logout function
                    await logout();
                    router.replace("/(auth)/login"); // Redirect to login
                },
            },
        ]);
    };

    const navigateToMyRides = () => {
        router.push('/(tabs)/myrides');
    };

    const navigateToSettings = () => {
        Alert.alert("Navigate", "This would take you to the settings screen.");
    };

    const navigateToEditProfile = () => {
        Alert.alert("Navigate", "This would take you to the edit profile screen.");
    }

    const toggleOnlineStatus = (value: boolean) => {
        setIsOnline(value);
        if (value) {
            LocationService.startLocationTracking();
        } else {
            LocationService.stopLocationTracking();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F4F7" }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Image
                        source={{
                            uri: user.photoURL || `https://ui-avatars.com/api/?name=${userName || "User"}&background=random`,
                        }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{userName || "Guest"}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={navigateToEditProfile}>
                        <Ionicons name="pencil" size={16} color="#007AFF" />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {userRole === "driver" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Driver Dashboard</Text>
                        <View style={styles.switchContainer}>
                            <MaterialCommunityIcons
                                name={isOnline ? "car-connected" : "car-off"}
                                size={24}
                                color={isOnline ? "#4CAF50" : "#666"}
                            />
                            <Text style={styles.switchLabel}>
                                {isOnline ? "You are Online" : "You are Offline"}
                            </Text>
                            <Switch
                                trackColor={{ false: "#D1D5DB", true: "#81b0ff" }}
                                thumbColor={isOnline ? "#007AFF" : "#f4f3f4"}
                                onValueChange={toggleOnlineStatus}
                                value={isOnline}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <OptionRow
                        icon={<Ionicons name="car-sport-outline" size={24} color="#007AFF" />}
                        title="My Rides"
                        onPress={navigateToMyRides}
                    />
                    <OptionRow
                        icon={<Ionicons name="settings-outline" size={24} color="#007AFF" />}
                        title="Settings"
                        onPress={navigateToSettings}
                    />
                </View>

                <View style={styles.section}>
                    <OptionRow
                        icon={<Ionicons name="log-out-outline" size={24} color="#FF3B30" />}
                        title="Logout"
                        onPress={handleLogout}
                        color="#FF3B30"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F0F4F7",
    },
    container: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    header: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#007AFF',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    email: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 16,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5EFFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    editButtonText: {
        marginLeft: 8,
        color: '#007AFF',
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
        marginLeft: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    optionArrow: {
        marginLeft: 'auto',
    },
});

