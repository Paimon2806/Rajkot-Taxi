// src/services/RideActionsService.ts

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Adjust path as needed
import { getAuth } from "firebase/auth";

/**
 * Accepts a ride by updating its status and assigning it to the current user.
 * @param rideId The ID of the ride document to accept.
 * @returns A Promise that resolves if the update is successful.
 * @throws An error if the user is not logged in or the Firestore update fails.
 */
export const acceptRide = async (rideId: string): Promise<void> => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        // Instead of an Alert here, throw an error to be handled by the UI component
        throw new Error("You must be logged in to accept a ride.");
    }

    try {
        const rideRef = doc(db, "rides", rideId);
        await updateDoc(rideRef, {
            assignedTo: user.uid,
            status: "accepted",
        });
        // You might want to return true or the updated ride data here if needed
    } catch (error) {
        console.error("Error accepting ride:", error);
        // Re-throw the error to be caught by the component calling this function
        throw new Error("Failed to accept ride. Please try again.");
    }
};

// You can add other ride-related actions here later, e.g., cancelRide, completeRide etc.
// export const cancelRide = async (rideId: string): Promise<void> => { /* ... */ };