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
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../config/firebaseConfig";
import RideCard from "../../components/RideCard";
import { Appbar, Text, useTheme, ActivityIndicator, Button } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { completeRide } from "../../services/RideActionsService";

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

export default function MyAcceptedRidesScreen() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const router = useRouter();

    const fetchAcceptedRides = () => {
        if (!currentUser) {
            setLoading(false);
            setRides([]);
            setRefreshing(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "rides"),
            where("assignedTo", "==", currentUser.uid),
            where("status", "in", ["accepted", "completed"]),
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
            console.error("Error fetching my accepted rides: ", error);
            setLoading(false);
            setRefreshing(false); // Ensure refreshing is set to false on error
            Alert.alert("Error", "Failed to load your accepted rides. Please try again.");
        });

        return () => unsubscribe();
    };

    useEffect(() => {
        fetchAcceptedRides();
    }, [currentUser]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAcceptedRides(); // Re-fetch data
    };

    const handleCompleteRide = async (rideId: string) => {
        try {
            await completeRide(rideId);
            Alert.alert("Success", "Ride marked as completed!");
        } catch (error: any) {
            console.error("Failed to complete ride:", error);
            Alert.alert("Error", error.message || "Could not complete ride.");
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
            onAccept={() => {}} // Not used on this screen
            onComplete={handleCompleteRide}
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
                <Appbar.Content title="My Accepted Rides" />
            </Appbar.Header>
            <FlatList
                data={rides}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={ // Step 2.3
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-circle-outline" size={60} color={theme.colors.onSurfaceVariant} />
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>No accepted rides yet</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                            When you accept a ride, it will appear here.
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => router.push('ridelist')}
                            style={{ marginTop: 16 }}
                        >
                            Browse Available Rides
                        </Button>
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