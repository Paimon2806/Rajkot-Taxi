import React, { useState } from "react"; // --- NEW: Import useState
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
    // --- NEW: State to handle loading while the form is submitting ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePostRide = async (rideData: {
        pickup: string;
        drop: string;
        date: string;
        time: string;
        price: string;
    }) => {
        // --- NEW: Basic validation ---
        if (!rideData.pickup || !rideData.drop || !rideData.price) {
            Alert.alert("Missing Information", "Please fill out the pickup, drop, and price fields.");
            return;
        }

        setIsSubmitting(true); // --- NEW: Start loading ---

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                Alert.alert("Error", "You must be logged in to post a ride.");
                return;
            }

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
                status: "pending",
            });

            Alert.alert("Success", "Ride posted successfully!");

            // --- NEW: Better navigation ---
            // Instead of the home screen, go to the "My Rides" tab.
            router.push("/(tabs)/myrides");

        } catch (error) {
            Alert.alert("Error", "Failed to post ride.");
            console.error(error);
        } finally {
            // --- NEW: Stop loading, whether it succeeded or failed ---
            setIsSubmitting(false);
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
                    {/* --- NEW: Pass the submitting state to the form --- */}
                    {/* This allows you to disable the button in RideForm if you want */}
                    <RideForm onSubmit={handlePostRide} isSubmitting={isSubmitting} />
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