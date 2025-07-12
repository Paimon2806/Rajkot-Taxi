// src/services/RideActionsService.ts

import {getAuth} from 'firebase/auth';
import {doc, updateDoc, getDoc} from 'firebase/firestore';
import {db} from '../config/firebaseConfig';

/**
 * Accepts a ride by updating its status and assignedTo fields
 * @param rideId The ID of the ride to accept
 * @returns Promise that resolves when the ride is successfully accepted
 */
export const acceptRideRequest = async (rideId: string): Promise<void> => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error('You must be logged in to accept a ride.');
    }

    // Get user document to fetch the name
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        throw new Error('User profile not found. Please try again.');
    }

    const userData = userDocSnap.data();
    const userName = userData.name || 'Anonymous';

    // First, get the ride to check if it's already assigned
    const rideDocRef = doc(db, 'rides', rideId);
    const rideDocSnap = await getDoc(rideDocRef);

    if (!rideDocSnap.exists()) {
        throw new Error('Ride not found.');
    }

    const rideData = rideDocSnap.data();

    // Check if the ride is already assigned
    if (rideData.assignedTo) {
        throw new Error('This ride has already been accepted by another driver.');
    }

    // Check if user's role is 'driver'
    if (userData.role !== 'driver') {
        throw new Error('Only drivers can accept rides.');
    }

    // Update the ride document
    await updateDoc(rideDocRef, {
        assignedTo: user.uid,
        assignedName: userName,
        status: 'accepted',
    });
};