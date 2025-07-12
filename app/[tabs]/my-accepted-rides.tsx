

import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    Alert,
} from "react-native";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../config/firebaseConfig";
import RideCard from "../../components/RideCard";

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
    timestamp: any;
}

export default function MyAcceptedRidesScreen() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            setRides([]);
            return;
        }

        const q = query(
            collection(db, "rides"),
            where("assignedTo", "==", currentUser.uid),
            where("status", "==", "accepted"),
            orderBy("timestamp", "desc")
        );

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

        return () => unsubscribe();
    }, [currentUser]);

    const handleActionOnAcceptedRide = (rideId: string) => {
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
            onAccept={() => handleActionOnAcceptedRide(item.id)}
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
                <Text style={styles.messageText}>
                    Looks like you haven't accepted any rides yet.
                </Text>
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