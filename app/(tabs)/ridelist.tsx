import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    Alert,
    RefreshControl,
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
import { Ionicons } from '@expo/vector-icons';

interface Ride {
    id: string;
    uid: string;
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
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    const fetchRides = () => {
        setLoading(true);
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
                    uid: data.uid,
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
            setRefreshing(false); // Ensure refreshing is set to false after data fetch
        }, (error) => {
            console.error("Error fetching rides: ", error);
            setLoading(false);
            setRefreshing(false); // Ensure refreshing is set to false on error
            Alert.alert("Error", "Failed to load rides. Please check your connection.");
        });

        return () => unsubscribe();
    };

    useEffect(() => {
        fetchRides();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRides(); // Re-fetch data
    };

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
            uid={item.uid}
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
                <Appbar.Action icon="refresh" onPress={onRefresh} />
            </Appbar.Header>
            <FlatList
                data={rides}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={ // Step 1.3
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={60} color={theme.colors.onSurfaceVariant} />
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>No rides available</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                            Check back later for new ride postings or post one yourself!
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