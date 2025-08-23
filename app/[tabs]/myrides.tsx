import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { getAuth } from 'firebase/auth';

// Define the structure of a Ride object for TypeScript
interface Ride {
    id: string;
    pickup: string;
    drop: string;
    status: string;
    assignedName: string | null;
    // Add other fields you might want to display
}

export default function MyRidesScreen() {
    const router = useRouter();
    const auth = getAuth();
    const user = auth.currentUser;

    const [myRides, setMyRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Function to fetch the user's rides
    const fetchMyRides = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            // 1. Create a query to find all rides where 'uid' matches the current user's ID
            const ridesQuery = query(
                collection(db, "rides"),
                where("uid", "==", user.uid),
                orderBy("timestamp", "desc") // Show the most recent rides first
            );

            // 2. Execute the query
            const querySnapshot = await getDocs(ridesQuery);

            // 3. Map the results to our Ride interface
            const rides = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Ride));

            setMyRides(rides);
        } catch (error) {
            console.error("Error fetching rides: ", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch rides when the screen loads
    useEffect(() => {
        fetchMyRides();
    }, [user]);

    // Handle pull-to-refresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchMyRides();
    };

    // Function to handle when a user taps on a ride
    const handleRidePress = (rideId: string) => {
        // Navigate to the dynamic ride tracking screen
        router.push(`/ride/${rideId}`);
    };

    // --- Render Functions ---

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (!user) {
        return <Text style={styles.centered}>Please log in to see your rides.</Text>;
    }

    if (myRides.length === 0) {
        return <Text style={styles.centered}>You haven't posted any rides yet.</Text>;
    }

    // This component renders each individual ride in the list
    const renderRideItem = ({ item }: { item: Ride }) => (
        <TouchableOpacity style={styles.rideItem} onPress={() => handleRidePress(item.id)}>
            <View>
                <Text style={styles.rideLocation}>From: {item.pickup}</Text>
                <Text style={styles.rideLocation}>To: {item.drop}</Text>
                <Text style={styles.rideDriver}>
                    {item.assignedName ? `Driver: ${item.assignedName}` : 'No driver assigned'}
                </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Posted Rides</Text>
            <FlatList
                data={myRides}
                renderItem={renderRideItem}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
}

// Helper function to color-code the ride status
const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#f0ad4e'; // Orange
        case 'accepted': return '#5cb85c'; // Green
        case 'in_progress': return '#337ab7'; // Blue
        case 'completed': return '#777';    // Gray
        case 'cancelled': return '#d9534f'; // Red
        default: return '#777';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rideItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    rideLocation: {
        fontSize: 16,
        fontWeight: '500',
    },
    rideDriver: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    statusBadge: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    }
});
