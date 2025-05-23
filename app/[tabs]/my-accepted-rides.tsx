// src/app/(tabs)/my-accepted-rides.tsx

import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    Alert, // Added for potential error messages
} from "react-native";
import {
    collection,
    query,
    where, // <--- Import 'where' for filtering
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <--- Import getAuth to get current user UID
import { db } from "../../config/firebaseConfig"; // Adjust path as needed
import RideCard from "../../components/RideCard";
import { acceptRide } from "../../services/RideActionsService"; // Re-use the acceptRide function if needed here, or if this screen only displays accepted rides, you might not need it.

// Define Ride interface (copy from RideList or put in a shared types file)
interface Ride {
    id: string;
    pickup: string;
    drop: string;
    date: string;
    time: string;
    price: string;
    username: string;
    status: string;
    assignedTo: string | null;
    timestamp: any; // Firestore timestamp
}

export default function MyAcceptedRidesScreen() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const currentUser = auth.currentUser; // Get the currently logged-in user

    useEffect(() => {
        if (!currentUser) {
            // If no user is logged in, we can't fetch assigned rides.
            // This scenario should ideally be handled by your _layout.tsx redirect.
            setLoading(false);
            setRides([]);
            return;
        }

        // <--- THE CRUCIAL CHANGE IS HERE: THE FIRESTORE QUERY ---
        const q = query(
            collection(db, "rides"),
            where("assignedTo", "==", currentUser.uid), // Filter by current user's UID
            where("status", "==", "accepted"), // Optionally filter only 'accepted' rides
            orderBy("timestamp", "desc")
        );
        // <--- END OF FIRESTORE QUERY CHANGE ---

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const ridesData: Ride[] = [];
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    ridesData.push({
                        id: docSnap.id,
                        pickup: data.pickup,
                        drop: data.drop,
                        date: data.date,
                        time: data.time,
                        price: data.price,
                        username: data.username,
                        status: data.status || "pending",
                        assignedTo: data.assignedTo || null,
                        timestamp: data.timestamp,
                    });
                });
                setRides(ridesData);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching my accepted rides: ", error);
                setLoading(false);
                Alert.alert("Error", "Failed to load your accepted rides. Please try again.");
            }
        );

        return () => unsubscribe(); // Cleanup the listener on unmount
    }, [currentUser]); // Re-run effect if currentUser changes (e.g., after login/logout)

    // You likely won't need an 'onAccept' functionality on this screen
    // because these are already accepted. However, if you add features
    // like 'cancel ride' or 'complete ride', you'd create similar handlers.
    const handleActionOnAcceptedRide = (rideId: string) => {
        // Implement actions like 'cancel' or 'complete' if needed
        Alert.alert("Ride Action", `You are trying to act on ride: ${rideId}`);
    };

    const renderItem = ({ item }: { item: Ride }) => (
        <RideCard
            rideId={item.id}
            pickup={item.pickup}
            drop={item.drop}
            price={item.price}
            date={item.date}
            time={item.time}
            username={item.username}
            status={item.status}
            assignedTo={item.assignedTo}
            // You might remove onAccept or replace it with a 'onCancel' or 'onComplete' handler
            onAccept={() => handleActionOnAcceptedRide(item.id)} // Placeholder action
        />
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (!currentUser) {
        return (
            <View style={styles.container}>
                <Text style={styles.messageText}>Please log in to view your accepted rides.</Text>
            </View>
        );
    }

    if (rides.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.messageText}>You haven't accepted any rides yet.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={rides}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f4f4",
        padding: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#f4f4f4',
    },
    messageText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#777',
        paddingHorizontal: 20,
    }
});