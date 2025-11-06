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
    uid: string; // Add uid of the ride poster
    status: string;
    assignedTo: string | null;
    carType?: string;
    tripType?: string;
    description?: string;
    onAccept?: (rideId: string) => void; // Make optional
    onComplete?: (rideId: string) => void;
}

export default function RideCard({
                                     pickup,
                                     drop,
                                     price,
                                     date,
                                     time,
                                     username,
                                     rideId,
                                     uid, // Destructure uid
                                     status,
                                     assignedTo,
                                     carType,
                                     tripType,
                                     onAccept,
                                     onComplete,
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
        // Condition for showing Accept Ride button
        if (!assignedTo && uid !== user?.uid && onAccept) {
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
        } 
        // Condition for the assigned driver
        else if (assignedTo === user?.uid) {
            if (status === 'completed') {
                return (
                    <View style={[styles.statusBadge, { backgroundColor: theme.colors.successContainer }]}>
                        <Text style={{ color: theme.colors.onSuccessContainer }}>Completed</Text>
                    </View>
                );
            }
            if (onComplete) {
                return (
                    <MotiView
                        from={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileTap={{ scale: 0.95, opacity: 0.8 }}
                        transition={{ type: 'timing', duration: 150 }}
                    >
                        <Button
                            mode="contained"
                            onPress={() => onComplete(rideId)}
                            style={[styles.acceptButton, { backgroundColor: theme.colors.success }]} // Assuming a success color in theme
                            labelStyle={styles.acceptButtonLabel}
                        >
                            Mark as Completed
                        </Button>
                    </MotiView>
                );
            }
            // Fallback for assigned driver if onComplete is not provided
            return (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.accentContainer }]}>
                    <Text style={{ color: theme.colors.onAccentContainer }}>Assigned to You</Text>
                </View>
            );
        } 
        // Condition for a ride taken by another driver
        else if (assignedTo) {
            return (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.errorContainer }]}>
                    <Text style={{ color: theme.colors.onErrorContainer }}>Taken</Text>
                </View>
            );
        }
        // If none of the above, render nothing (e.g., for the poster viewing their own unassigned ride)
        return null;
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
                    <Card.Content style={styles.cardContent}>
                        <View style={styles.header}>
                            <Ionicons name="person-circle-outline" size={24} color={theme.colors.primary} style={styles.icon} />
                            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{username}</Text>
                        </View>

                        <View style={styles.routeContainer}>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={18} color={theme.colors.onSurfaceVariant} />
                                <Text variant="bodyLarge" style={styles.locationText}>{pickup}</Text>
                            </View>
                            <Ionicons name="arrow-down-outline" size={18} color={theme.colors.onSurfaceVariant} style={styles.arrowIcon} />
                            <View style={styles.locationRow}>
                                <Ionicons name="flag-outline" size={18} color={theme.colors.onSurfaceVariant} />
                                <Text variant="bodyLarge" style={styles.locationText}>{drop}</Text>
                            </View>
                        </View>

                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurfaceVariant} />
                                <Text variant="bodyMedium" style={styles.detailText}>{date}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={16} color={theme.colors.onSurfaceVariant} />
                                <Text variant="bodyMedium" style={styles.detailText}>{time}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="wallet-outline" size={16} color={theme.colors.onSurfaceVariant} />
                                <Text variant="bodyMedium" style={styles.detailText}>₹{price}</Text>
                            </View>
                        </View>

                        <View style={styles.detailsRow}>
                            {carType && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="car-outline" size={16} color={theme.colors.onSurfaceVariant} />
                                    <Text variant="bodyMedium" style={styles.detailText}>{carType}</Text>
                                </View>
                            )}
                            {tripType && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="repeat-outline" size={16} color={theme.colors.onSurfaceVariant} />
                                    <Text variant="bodyMedium" style={styles.detailText}>{tripType}</Text>
                                </View>
                            )}
                        </View>

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
    cardContent: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    icon: {
        marginRight: 8,
    },
    routeContainer: {
        marginBottom: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationText: {
        marginLeft: 8,
        fontWeight: 'bold',
        fontSize: 18,
    },
    arrowIcon: {
        alignSelf: 'center',
        marginVertical: 4,
        marginLeft: 2,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    detailText: {
        marginLeft: 6,
        fontSize: 15,
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