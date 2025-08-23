import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig'; // Assuming your firebaseConfig is here

// --- Task Name ---
const LOCATION_TRACKING_TASK = 'background-location-task';

// --- Define the Background Task ---
// This part remains mostly the same. It runs in the background and its only
// job is to update the location for the currently logged-in driver.
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (error) {
        console.error('Background location task error:', error.message);
        return;
    }

    const locations = (data as any)?.locations;
    if (locations && locations.length > 0 && user) {
        const { latitude, longitude } = locations[0].coords;
        console.log('📍 Received new background location', { latitude, longitude });

        try {
            const driverDocRef = doc(db, 'drivers', user.uid);
            // Use setDoc with merge:true to ONLY update location and lastSeen,
            // without overwriting name, uid, or isOnline status.
            await setDoc(driverDocRef, {
                location: { latitude, longitude },
                lastSeen: serverTimestamp(),
            }, { merge: true });
            console.log('✅ Firebase updated with new location for driver:', user.uid);
        } catch (dbError) {
            console.error('Failed to write background location to Firebase:', dbError);
        }
    }
});

// --- Service Functions ---

/**
 * Starts tracking the driver's location.
 * This function is now responsible for setting the driver's "online" status.
 */
const startLocationTracking = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        alert('You must be logged in to go online.');
        return;
    }

    try {
        // 1. Request permissions first
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            alert('Foreground location permission is required to go online.');
            return;
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            alert('Background location permission is required to stay online in the background.');
            return;
        }

        // 2. Fetch driver's name from the 'users' collection
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const username = userDocSnap.exists() && userDocSnap.data().name
            ? userDocSnap.data().name
            : "Anonymous Driver";

        // 3. Set the driver's status to 'online' in Firestore
        const driverDocRef = doc(db, 'drivers', user.uid);
        await setDoc(driverDocRef, {
            uid: user.uid,
            name: username,
            isOnline: true,
            lastSeen: serverTimestamp(),
        }, { merge: true }); // Use merge to avoid overwriting location if it already exists

        // 4. Start the background location updates
        await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 10000, // 10 seconds
            distanceInterval: 50, // 50 meters
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: 'You are Online',
                notificationBody: 'Your location is being shared with customers.',
                notificationColor: '#333333',
            },
        });

        console.log('🚀 Driver is now online and location tracking has started.');
    } catch (error) {
        console.error('Error starting location tracking:', error);
    }
};

/**
 * Stops tracking the driver's location and sets their status to "offline".
 */
const stopLocationTracking = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    try {
        // 1. Stop the background task first
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
            console.log('🛑 Background location tracking stopped.');
        }

        // 2. Update the driver's status to 'offline' in Firestore
        if (user) {
            const driverDocRef = doc(db, 'drivers', user.uid);
            await setDoc(driverDocRef, {
                isOnline: false,
            }, { merge: true });
            console.log(' Driver is now offline.');
        }
    } catch (error) {
        console.error('Error stopping location tracking:', error);
    }
};

// Export the functions to be used in your components
export const LocationService = {
    startLocationTracking,
    stopLocationTracking,
};
