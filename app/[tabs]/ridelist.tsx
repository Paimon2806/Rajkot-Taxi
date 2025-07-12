import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Text,
} from "react-native";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig"; // Ensure this path is correct
import RideCard from "../../components/RideCard";
import { acceptRideRequest } from "../../services/RideActionsService"; // <--- IMPORT THE NEW SERVICE FUNCTION

// Define Ride interface
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

export default function RideList() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    // No need for getAuth() and user here anymore, as acceptRide handles it
    // const auth = getAuth();
    // const user = auth.currentUser;

    useEffect(() => {
        const q = query(
            collection(db, "rides"),
            orderBy("timestamp", "desc")
        );

        // onSnapshot gives real-time updates for the list
        return onSnapshot(q, (querySnapshot) => {
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
                console.error("Error fetching rides: ", error);
                setLoading(false);
                // Optionally show an alert for list fetching error
                Alert.alert("Error", "Failed to load rides. Please check your connection.");
            }
        );
    }, []);

    // <--- handleAcceptRide NOW USES THE SEPARATE SERVICE FUNCTION ---
    const handleAcceptRide = async (rideId: string) => {
        try {
            await acceptRideRequest(rideId); // Call the separated service function
            Alert.alert("Success", "Ride accepted!");
        } catch (error: any) { // Type 'any' for error caught from async functions
            console.error("Failed to accept ride:", error);
            // Display the user-friendly message from the service, or a generic one
            Alert.alert("Error", error.message || "Could not accept ride.");
        }
    };
    // <--- END OF CHANGE ---

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
            onAccept={handleAcceptRide} // Still passes the handler down
        />
    );


    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007bff" />
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
                ListEmptyComponent={<Text style={styles.emptyListText}>No rides available yet.</Text>}
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
    },
    emptyListText: { // Added style for empty list message
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#777',
    }
});