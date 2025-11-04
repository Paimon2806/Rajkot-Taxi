import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import LiveMapView from '../../components/LiveMapView'; // Import our map component

// Define the structure of a Ride object for TypeScript
interface Ride {
    id: string;
    pickup: string;
    drop: string;
    price: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    assignedTo: string | null; // This will hold the driver's UID
    assignedName: string | null;
    carType?: string;
    tripType?: string;
    description?: string;
}

export default function RideTrackingScreen() {
    // 1. Get the rideId from the URL (e.g., /ride/xyz123)
    const { rideId } = useLocalSearchParams<{ rideId: string }>();

    // 2. State to hold the real-time ride data
    const [ride, setRide] = useState<Ride | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!rideId) return;

        // 3. Set up a real-time listener for this specific ride document
        const rideDocRef = doc(db, 'rides', rideId);

        const unsubscribe = onSnapshot(rideDocRef, (docSnap) => {
            if (docSnap.exists()) {
                // When the document updates, update our state
                const data = docSnap.data();
                setRide({
                    id: docSnap.id,
                    pickup: data.pickup,
                    drop: data.drop,
                    price: data.price,
                    status: data.status || "pending",
                    assignedTo: data.assignedTo || null,
                    assignedName: data.assignedName || null,
                    carType: data.carType || null,
                    tripType: data.tripType || null,
                    description: data.description || null,
                } as Ride);
            } else {
                console.error("No such ride document!");
                // Optionally, navigate the user away or show an error
            }
            setLoading(false);
        });

        // Cleanup the listener when the screen is unmounted
        return () => unsubscribe();
    }, [rideId]); // Rerun the effect if rideId changes

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (!ride) {
        return <Text style={styles.centered}>Ride not found.</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.detailsContainer}>
                <Text style={styles.title}>Tracking Your Ride</Text>
                <Text style={styles.detailText}>From: {ride.pickup}</Text>
                <Text style={styles.detailText}>To: {ride.drop}</Text>
                {ride.carType && <Text style={styles.detailText}>Car Type: {ride.carType}</Text>}
                {ride.tripType && <Text style={styles.detailText}>Trip Type: {ride.tripType}</Text>}
                <Text style={styles.detailText}>Price: ₹{ride.price}</Text>
                {ride.description && <Text style={styles.detailText}>Description: {ride.description}</Text>}
                <Text style={styles.statusText}>
                    Status: <Text style={styles.statusValue}>{ride.status.replace('_', ' ')}</Text>
                </Text>
                {ride.assignedName && (
                    <Text style={styles.detailText}>Driver: {ride.assignedName}</Text>
                )}
            </View>

            {/* --- THE MAGIC HAPPENS HERE --- */}
            <View style={styles.mapContainer}>
                {ride.assignedTo ? (
                    // 4. If a driver is assigned, show the LiveMapView
                    <LiveMapView driverId={ride.assignedTo} />
                ) : (
                    // 5. If no driver is assigned yet, show a waiting message
                    <View style={styles.waitingContainer}>
                        <Text style={styles.waitingText}>Searching for a driver...</Text>
                        <ActivityIndicator style={{marginTop: 10}} />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    detailsContainer: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#e0e0e0', // A placeholder background color
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    statusText: {
        fontSize: 18,
        marginTop: 10,
        fontWeight: 'bold',
    },
    statusValue: {
        textTransform: 'capitalize',
        color: '#0077cc',
    },
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitingText: {
        fontSize: 18,
        color: '#555',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});