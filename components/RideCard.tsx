import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";

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
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const renderStatus = () => {
        if (!assignedTo) {
            return (
                <TouchableOpacity
                    onPress={() => onAccept(rideId)}
                    style={styles.acceptButton}
                >
                    <Text style={styles.buttonText}>Accept Ride</Text>
                </TouchableOpacity>
            );
        } else if (assignedTo === user?.uid) {
            return <Text style={[styles.status, styles.assignedToYou]}>Assigned to You</Text>;
        } else {
            return <Text style={[styles.status, styles.taken]}>Taken</Text>;
        }
    };

    return (
        <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
            <View style={styles.header}>
                <Ionicons name="car" size={22} color="#1976D2" style={styles.icon} />
                <Text style={styles.username}>{username}</Text>
            </View>
            <Text style={styles.route}>{pickup} → {drop}</Text>
            <Text style={styles.details}>Fare: ₹{price}</Text>
            <Text style={styles.details}>Date: {date} at {time}</Text>
            <View style={styles.statusWrapper}>{renderStatus()}</View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#E3F2FD",
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    icon: {
        marginRight: 6,
    },
    username: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1976D2",
    },
    route: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#0D47A1",
        marginBottom: 6,
    },
    details: {
        fontSize: 14,
        color: "#555",
    },
    statusWrapper: {
        marginTop: 12,
    },
    acceptButton: {
        backgroundColor: "#1976D2",
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    status: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        fontWeight: "600",
        textAlign: "center",
        alignSelf: "flex-start",
    },
    assignedToYou: {
        backgroundColor: "#C8E6C9",
        color: "#2E7D32",
    },
    taken: {
        backgroundColor: "#FFCDD2",
        color: "#C62828",
    },
});
