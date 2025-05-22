import React from "react";
import {
    Text,
    StyleSheet,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    View,
} from "react-native";
import RideForm from "../../components/RideForm";
import { useRouter } from "expo-router";
import { db } from "../../config/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function RidePost() {
    const router = useRouter();

    const handlePostRide = async (rideData: {
        pickup: string;
        drop: string;
        date: string;
        time: string;
        price: string;
    }) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                Alert.alert("Error", "You must be logged in to post a ride.");
                return;
            }

            // Retrieve the user's document from the "users" collection
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const username = userDocSnap.exists() && userDocSnap.data().name
                ? userDocSnap.data().name
                : "Anonymous";

            await addDoc(collection(db, "rides"), {
                ...rideData,
                uid: user.uid,
                username,
                timestamp: serverTimestamp(),
                assignedTo: null,
                assignedName: null,
                status: "pending", // could be 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
            });

            Alert.alert("Success", "Ride posted successfully!");
            router.push("/[tabs]/home");
        } catch (error) {
            Alert.alert("Error", "Failed to post ride.");
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Post a Ride</Text>
                    <RideForm onSubmit={handlePostRide} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#0077cc",
        marginBottom: 20,
        textAlign: "center",
    }
});
