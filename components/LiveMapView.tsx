import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { MapView, Marker, PROVIDER_GOOGLE } from './MapViewWrapper'; // Adjust path if needed
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// --- Props Interface ---
// We define what properties this component will accept.
// This makes it reusable for any driver.
interface LiveMapViewProps {
    driverId: string;
}

// --- Mock Initial Location (e.g., your city center) ---
// The map needs an initial place to focus on before we get the driver's live location.
const INITIAL_LOCATION = {
    latitude: 23.2156, // Example: Gandhinagar, Gujarat
    longitude: 72.6369,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

// --- Driver Location State ---
// This interface defines the structure for the driver's location data.
interface DriverLocation {
    latitude: number;
    longitude: number;
}

const LiveMapView: React.FC<LiveMapViewProps> = ({ driverId }) => {
    // State to hold the driver's current location.
    const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
    // State to handle any potential errors during data fetching.
    const [error, setError] = useState<string | null>(null);
    // Ref to the MapView component to control it programmatically (e.g., to move the camera).
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        // --- Firebase Integration ---
        // This effect runs when the component mounts and listens for real-time location updates.

        // 1. Initialize Firestore. Make sure your firebaseConfig.js exports this correctly.
        const db = getFirestore();

        // 2. Define the path to the driver's document in Firestore.
        //    We assume you have a 'drivers' collection where each document is a driver's ID,
        //    and it contains a 'location' field.
        const driverDocRef = doc(db, 'drivers', driverId);

        // 3. Set up the real-time listener.
        //    onSnapshot listens for any changes to the document.
        const unsubscribe = onSnapshot(driverDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Assuming the location is stored as a GeoPoint or an object with latitude/longitude.
                const location = data.location;
                if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
                    setDriverLocation({
                        latitude: location.latitude,
                        longitude: location.longitude,
                    });
                    setError(null);

                    // --- Animate Map to Driver's Location ---
                    // When we get a new location, we smoothly move the map to center on the driver.
                    mapRef.current?.animateToRegion({
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01, // Zoom in closer
                        longitudeDelta: 0.01,
                    }, 1000); // Animate over 1 second

                } else {
                    setError('Location data is not in the expected format.');
                }
            } else {
                setError('Driver not found.');
            }
        }, (err) => {
            // Handle any errors with the listener itself.
            console.error("Firebase listener error:", err);
            setError('Failed to fetch location.');
        });

        // 4. Cleanup function.
        //    This is crucial to prevent memory leaks. When the component is unmounted,
        //    it stops listening for updates.
        return () => unsubscribe();

    }, [driverId]); // The effect re-runs only if the driverId prop changes.

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE} // This is important to use Google Maps
                initialRegion={INITIAL_LOCATION}
                showsUserLocation={true} // Optionally show the customer's location
            >
                {/* --- Driver Marker --- */}
                {/* We only show the marker if we have a valid driver location. */}
                {driverLocation && (
                    <Marker
                        coordinate={driverLocation}
                        title="Driver"
                        description="This is the driver's current location."
                    >
                        {/* You can use a custom image for the marker, like a car icon */}
                        <View style={styles.marker}>
                            <Text style={styles.markerText}>🚖</Text>
                        </View>
                    </Marker>
                )}
            </MapView>

            {/* --- Error Display --- */}
            {/* If there's an error (e.g., driver not found), we display it. */}
            {error && (
                <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    marker: {
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 20,
        borderColor: '#000',
        borderWidth: 1,
    },
    markerText: {
        fontSize: 24,
    },
    errorOverlay: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    errorText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default LiveMapView;
