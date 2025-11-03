import React from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert,
} from "react-native";
import {
    Avatar,
    Button,
    Card,
    Divider,
    List,
    SegmentedButtons,
    Text,
    useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { MotiView } from 'moti';

import { Appbar } from 'react-native-paper';

export default function ProfileScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { user, userName, userRole } = useAuth();
    const { themeMode, setThemeMode } = useThemeContext();
    const { logout } = useAuth(); // Get logout function from context

    const handleLogout = async () => {
        console.log("ProfileScreen: Logout button pressed (direct call).");
        try {
            await logout();
            // The AuthProvider will handle redirecting to the login screen
        } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Profile" />
            </Appbar.Header>
            <ScrollView contentContainerStyle={styles.container}>
                <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing' }}
                >
                    <View style={styles.header}>
                        <Avatar.Text size={80} label={userName?.charAt(0) || 'U'} style={styles.avatar} />
                        <Text variant="headlineLarge" style={styles.name}>{userName || "Guest"}</Text>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            {user?.email} ({userRole})
                        </Text>
                    </View>
                </MotiView>

                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', delay: 200 }}
                >
                    <Card style={styles.section}>
                        <Card.Title title="Quick Stats" />
                        <Card.Content style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text variant="headlineMedium">12</Text>
                                <Text variant="bodyMedium">Rides Completed</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text variant="headlineMedium">4.9 ★</Text>
                                <Text variant="bodyMedium">Rating</Text>
                            </View>
                        </Card.Content>
                    </Card>
                </MotiView>

                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', delay: 300 }}
                >
                    <Card style={styles.section}>
                        <Card.Title title="Preferences" />
                        <List.Item
                            title="App Theme"
                            description="Choose your preferred interface look"
                            left={() => <List.Icon icon="palette" />}
                        />
                        <SegmentedButtons
                            value={themeMode}
                            onValueChange={(value) => setThemeMode(value as any)}
                            buttons={[
                                { value: 'light', label: 'Light' },
                                { value: 'dark', label: 'Dark' },
                                { value: 'system', label: 'System' },
                            ]}
                            style={styles.segmentedButtons}
                        />
                    </Card>
                </MotiView>

                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', delay: 400 }}
                >
                    <Card style={styles.section}>
                        <List.Item
                            title="My Rides History"
                            description="View all your past journeys"
                            left={() => <List.Icon icon="history" />}
                            onPress={() => router.push('/my-posted-rides')}
                        />
                        <Divider />
                        <List.Item
                            title="Support & FAQ"
                            description="Get help and find answers"
                            left={() => <List.Icon icon="help-circle-outline" />}
                            onPress={() => Alert.alert("Support", "This would navigate to the support screen.")}
                        />
                    </Card>
                </MotiView>

                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', delay: 500 }}
                >
                    <Button
                        icon="logout"
                        mode="contained"
                        onPress={handleLogout}
                        style={styles.logoutButton}
                        buttonColor={theme.colors.error}
                    >
                        Logout
                    </Button>
                </MotiView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        marginBottom: 16,
    },
    name: {
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    segmentedButtons: {
        margin: 16,
    },
    logoutButton: {
        marginTop: 16,
    },
});