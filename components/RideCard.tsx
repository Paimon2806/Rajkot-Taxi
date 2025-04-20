import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RideCardProps {
    pickup: string;
    drop: string;
    price: string;
    date: string;
    time: string;
    username: string;
}

export default function RideCard({
                                     pickup,
                                     drop,
                                     price,
                                     date,
                                     time,
                                     username,
                                 }: RideCardProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

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
    }, [opacity, translateY]);

    return (
        <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
            <View style={styles.header}>
                <Ionicons name="car" size={22} color="#1976D2" style={styles.icon} />
                <Text style={styles.username}>{username}</Text>
            </View>
            <Text style={styles.route}>
                {pickup} → {drop}
            </Text>
            <Text style={styles.details}>Fare: ₹{price}</Text>
            <Text style={styles.details}>
                Date: {date} at {time}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#E3F2FD", // Light blue background
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
        color: "#1976D2", // Deep blue accent
    },
    route: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#0D47A1", // Primary text
        marginBottom: 6,
    },
    details: {
        fontSize: 14,
        color: "#555", // Soft gray
    },
});
