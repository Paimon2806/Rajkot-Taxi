import React from "react";
import {
    View,
    StyleSheet,
} from "react-native";
import { Card, Text, Button, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { MotiView } from 'moti';

interface RideCardProps {
    pickup: string;
    drop: string;
    price: string;
    date: string;
    time: string;
    username: string;
    rideId: string;
    status: string;
    assignedTo: string | null;
    onAccept: (rideId: string) => void;
}

export default function RideCard({
                                     pickup,
                                     drop,
                                     price,
                                     date,
                                     time,
                                     username,
                                     rideId,
                                     status,
                                     assignedTo,
                                     onAccept,
                                 }: RideCardProps) {
    const theme = useTheme();
    const auth = getAuth();
    const user = auth.currentUser;

    const getStatusColor = (currentStatus: string) => {
        switch (currentStatus) {
            case 'pending': return theme.colors.primary;
            case 'accepted': return theme.colors.accent;
            case 'in_progress': return theme.colors.info; // Assuming an info color in theme
            case 'completed': return theme.colors.onSurfaceVariant;
            case 'cancelled': return theme.colors.error;
            default: return theme.colors.onSurfaceVariant;
        }
    };

    const renderStatusAction = () => {
        if (!assignedTo) {
            return (
                <MotiView
                    from={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.95, opacity: 0.8 }}
                    transition={{ type: 'timing', duration: 150 }}
                >
                    <Button
                        mode="contained"
                        onPress={() => onAccept(rideId)}
                        style={styles.acceptButton}
                        labelStyle={styles.acceptButtonLabel}
                    >
                        Accept Ride
                    </Button>
                </MotiView>
            );
        } else if (assignedTo === user?.uid) {
            return (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.accentContainer }]}>
                    <Text style={{ color: theme.colors.onAccentContainer }}>Assigned to You</Text>
                </View>
            );
        } else {
            return (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.errorContainer }]}>
                    <Text style={{ color: theme.colors.onErrorContainer }}>Taken</Text>
                </View>
            );
        }
    };

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.motiContainer}
        >
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <MotiView
                    from={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.98, opacity: 0.95 }}
                    transition={{ type: 'timing', duration: 150 }}
                    style={{ flex: 1 }}
                >
                    <Card.Content>
                        <View style={styles.header}>
                            <Ionicons name="car" size={24} color={theme.colors.primary} style={styles.icon} />
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{username}</Text>
                        </View>
                        <Text variant="headlineSmall" style={[styles.route, { color: theme.colors.onSurface }]}>
                            {pickup} → {drop}
                        </Text>
                        <Text variant="bodyMedium" style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>
                            Fare: ₹{price}
                        </Text>
                        <Text variant="bodyMedium" style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>
                            Date: {date} at {time}
                        </Text>
                        <View style={styles.statusActionWrapper}>
                            {renderStatusAction()}
                        </View>
                    </Card.Content>
                </MotiView>
            </Card>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    motiContainer: {
        marginBottom: 16,
    },
    card: {
        borderRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    icon: {
        marginRight: 8,
    },
    route: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    details: {
        marginBottom: 4,
    },
    statusActionWrapper: {
        marginTop: 16,
        alignItems: 'flex-start',
    },
    acceptButton: {
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    acceptButtonLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
});