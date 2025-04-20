import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
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
    timestamp: any; // Firestore timestamp
}

export default function RideList() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Create a query to order rides by timestamp (desc)
        const q = query(collection(db, "rides"), orderBy("timestamp", "desc"));

        // Listen for realtime updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ridesData: Ride[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                ridesData.push({
                    id: doc.id,
                    pickup: data.pickup,
                    drop: data.drop,
                    date: data.date,
                    time: data.time,
                    price: data.price,
                    username: data.username,
                    timestamp: data.timestamp,
                });
            });
            setRides(ridesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching rides: ", error);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Render each ride with a fade-in animation
    const renderItem = ({ item }: { item: Ride }) => {
        return (
            <RideCard
                pickup={item.pickup}
                drop={item.drop}
                price={item.price}
                date={item.date}
                time={item.time}
                username={item.username}
            />
        );
    };


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
    }
});
