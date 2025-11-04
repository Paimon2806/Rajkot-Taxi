import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    Alert,
} from "react-native";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import RideCard from "../../components/RideCard";
import { acceptRideRequest } from "../../services/RideActionsService";
import { Appbar, Text, useTheme, ActivityIndicator } from "react-native-paper";

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
    carType?: string;
    tripType?: string;
    description?: string;
    timestamp: any;
}

export default function RideList() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        const q = query(
            collection(db, "rides"),
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
                    carType: data.carType || null,
                    tripType: data.tripType || null,
                    description: data.description || null,
                    timestamp: data.timestamp,
                });
            });
            setRides(ridesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching rides: ", error);
            setLoading(false);
            Alert.alert("Error", "Failed to load rides. Please check your connection.");
        });

        return () => unsubscribe();
    }, []);

    const handleAcceptRide = async (rideId: string) => {
        try {
            await acceptRideRequest(rideId);
            Alert.alert("Success", "Ride accepted!");
        } catch (error: any) {
            console.error("Failed to accept ride:", error);
            Alert.alert("Error", error.message || "Could not accept ride.");
        }
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
            carType={item.carType}
            tripType={item.tripType}
            description={item.description}
            onAccept={handleAcceptRide}
        />
    );

    if (loading) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                <Appbar.Content title="Available Rides" />
            </Appbar.Header>
            <FlatList
                data={rides}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="headlineSmall">No rides available</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Check back later for new ride postings.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
});