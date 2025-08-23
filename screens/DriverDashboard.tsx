// In a screen file like app/(tabs)/profile.tsx (for the driver)
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Button } from 'react-native';
import { LocationService } from '../services/LocationService'; // Adjust path if needed

export default function DriverDashboard() {
    const [isOnline, setIsOnline] = useState(false);

    const toggleOnlineStatus = (value: boolean) => {
        setIsOnline(value);
        if (value) {
            // User wants to go online
            console.log("Going online...");
            LocationService.startLocationTracking();
        } else {
            // User wants to go offline
            console.log("Going offline...");
            LocationService.stopLocationTracking();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Driver Dashboard</Text>
            <View style={styles.switchContainer}>
                <Text style={styles.label}>{isOnline ? 'You are Online' : 'You are Offline'}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isOnline ? "#f5dd4b" : "#f4f3f4"}
                    onValueChange={toggleOnlineStatus}
                    value={isOnline}
                />
            </View>
            <Text style={styles.info}>
                Toggle the switch to start or stop sharing your location with customers.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginRight: 10,
    },
    info: {
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
    },
});