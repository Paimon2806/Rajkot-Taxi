import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Switch, useTheme, Avatar } from 'react-native-paper';
import { MotiView } from 'moti';
import { LocationService } from '../services/LocationService'; // Adjust path if needed

export default function DriverDashboard() {
    const [isOnline, setIsOnline] = useState(false);
    const theme = useTheme();

    const toggleOnlineStatus = (value: boolean) => {
        setIsOnline(value);
        if (value) {
            console.log("Going online...");
            LocationService.startLocationTracking();
        } else {
            console.log("Going offline...");
            LocationService.stopLocationTracking();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 500 }}
                style={styles.motiContainer}
            >
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Avatar.Icon
                            icon={isOnline ? "car-connected" : "car-off"}
                            size={64}
                            style={{ backgroundColor: isOnline ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
                            color={isOnline ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        />
                        <Text variant="headlineMedium" style={styles.title}>
                            Driver Status
                        </Text>
                        <Text variant="bodyLarge" style={styles.statusText}>
                            {isOnline ? 'You are Online' : 'You are Offline'}
                        </Text>
                        <Switch
                            value={isOnline}
                            onValueChange={toggleOnlineStatus}
                            color={theme.colors.primary}
                        />
                        <Text variant="bodySmall" style={[styles.info, { color: theme.colors.onSurfaceVariant }]}>
                            Toggle to start or stop sharing your location.
                        </Text>
                    </Card.Content>
                </Card>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    motiContainer: {
        width: '100%',
    },
    card: {
        elevation: 4,
    },
    cardContent: {
        alignItems: 'center',
        padding: 24,
    },
    title: {
        marginTop: 16,
        marginBottom: 8,
    },
    statusText: {
        marginBottom: 16,
        fontSize: 18,
    },
    info: {
        marginTop: 16,
        textAlign: 'center',
    },
});