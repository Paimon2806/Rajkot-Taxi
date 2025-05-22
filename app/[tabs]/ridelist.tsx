import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../config/firebaseConfig";
import RideCard from "../../components/RideCard";

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
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const q = query(
            collection(db, "rides"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
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
            }
        );

        return unsubscribe;
    }, []);

    const handleAcceptRide = async (rideId: string) => {
        if (!user) {
            Alert.alert("Error", "Login to accept a ride.");
            return;
        }
        try {
            const rideRef = doc(db, "rides", rideId);
            await updateDoc(rideRef, {
                assignedTo: user.uid,
                status: "accepted",
            });
            Alert.alert("Success", "Ride accepted!");
        } catch (error) {
            console.error("Failed to accept ride:", error);
            Alert.alert("Error", "Could not accept ride.");
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
            onAccept={handleAcceptRide}
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
});
