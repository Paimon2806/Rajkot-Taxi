import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  limit
} from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../config/firebaseConfig";
import { logout } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import {LocationService} from "../../services/LocationService";

interface Ride {
  id: string;
  pickup: string;
  drop: string;
  date: string;
  time: string;
  price: number;
  uid: string;
  username: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  timestamp: Timestamp;
}

export default function HomeScreen() {
  const router = useRouter();


  const { user, userName, userRole, isLoading } = useAuth();


  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);


  const [pendingRequests, setPendingRequests] = useState<Ride[]>([]);

    const [isOnline, setIsOnline] = useState(false);

    const navigateToProfile = () => {
        // Use the router to navigate to the standalone profile screen
        router.push('/profile');
    };

    // This function is called when the driver flips the switch
    const toggleOnlineStatus = (value: boolean) => {
        setIsOnline(value);
        if (value) {
            // If the switch is turned ON
            console.log("Driver is going online...");
            LocationService.startLocationTracking();
        } else {
            // If the switch is turned OFF
            console.log("Driver is going offline...");
            LocationService.stopLocationTracking();
        }
    };


  useEffect(() => {

    if (!userRole || !user?.uid) {
      setUpcomingRides([]);
      setPendingRequests([]);
      return;
    }

    let unsubscribeRides: (() => void) | undefined;

    const fetchRides = () => {
      if (userRole === "passenger") {
        const ridesQuery = query(
            collection(db, "rides"),
            where("assignedTo", "==", user.uid), // Rides assigned to current passenger
            where("status", "in", ["accepted", "in_progress"]), // Accepted or currently in progress
            orderBy("timestamp", "asc"), // Order by oldest first
            limit(2) // Get next 1-2 rides
        );
        unsubscribeRides = onSnapshot(ridesQuery, (snapshot) => {
          const ridesData: Ride[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<Ride, 'id'>, // Cast to Ride type, excluding ID
            timestamp: doc.data().timestamp // Ensure timestamp is correctly typed
          }));
          setUpcomingRides(ridesData);
        }, (err) => {
          console.error("Error fetching upcoming rides:", err);
          // Consider setting an error state in the Context if you want global error display
        });
      } else if (userRole === "driver") {
        const ridesQuery = query(
            collection(db, "rides"),
            where("uid", "==", user.uid), // Rides posted by current driver
            where("status", "==", "pending"), // Rides awaiting passenger acceptance
            orderBy("timestamp", "asc"), // Order by oldest first
            limit(2) // Get next 1-2 pending requests
        );
        unsubscribeRides = onSnapshot(ridesQuery, (snapshot) => {
          const ridesData: Ride[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<Ride, 'id'>,
            timestamp: doc.data().timestamp
          }));
          setPendingRequests(ridesData);
        }, (err) => {
          console.error("Error fetching pending requests:", err);
          // Consider setting an error state in the Context if you want global error display
        });
      }
    }

    fetchRides();

    return () => {
      if (unsubscribeRides) {
        unsubscribeRides();
      }
    };
  }, [user?.uid, userRole]); // Re-run when userId or userRole changes

  // --- Navigation Handlers ---
  const handleFindRides = () => {
    router.push('/(tabs)/ridelist'); // Navigate to the ride list/search screen
  };

  const handlePostNewRide = () => {
    router.push('/(tabs)/ridepost'); // Navigate to the ride posting screen
  };

  const handleViewAllJourneys = () => {
    router.push('/(tabs)/my-accepted-rides'); // Navigate to the user's past/all journeys
  };

  // --- Logout Handler ---
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout service
      router.replace("/login"); // Redirect to the login screen
    } catch (err) {
      console.error("Logout failed:", err);
      // Consider setting a global error in the context
    }
  };

  // --- Conditional Rendering for Loading and Error States ---
  if (isLoading) {
    return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your personalized dashboard...</Text>
        </View>
    );
  }

  // --- Main Dashboard UI ---
  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.greeting}>Welcome, {userName}!</Text>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Home</Text>
                <TouchableOpacity onPress={navigateToProfile} style={styles.profileButton}>
                    <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
                </TouchableOpacity>
            </View>

          {/* Passenger-specific UI sections */}
          {userRole === "passenger" && (
              <>
                {/* Find Your Next Ride Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Find Your Next Ride</Text>
                  <TextInput
                      style={styles.input}
                      placeholder="Pickup Location"
                      value={pickupLocation}
                      onChangeText={setPickupLocation}
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="Drop-off Location"
                      value={dropoffLocation}
                      onChangeText={setDropoffLocation}
                  />
                  <TouchableOpacity style={styles.primaryButton} onPress={handleFindRides}>
                    <Text style={styles.primaryButtonText}>Find Rides</Text>
                  </TouchableOpacity>
                </View>

                {/* Your Upcoming Rides Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Upcoming Rides</Text>
                  {upcomingRides.length > 0 ? (
                      upcomingRides.map((ride) => ( // Display next 1-2 rides from query
                          <View key={ride.id} style={styles.rideSummaryCard}>
                            <Text style={styles.rideSummaryText}>
                              <Text style={styles.boldText}>From:</Text> {ride.pickup}
                            </Text>
                            <Text style={styles.rideSummaryText}>
                              <Text style={styles.boldText}>To:</Text> {ride.drop}
                            </Text>
                            <Text style={styles.rideSummaryText}>
                              <Text style={styles.boldText}>On:</Text> {new Date(ride.timestamp.toDate()).toLocaleDateString()} at {ride.time}
                            </Text>
                            <Text style={styles.rideSummaryText}>
                              <Text style={styles.boldText}>Status:</Text> {ride.status.replace(/_/g, ' ')}
                            </Text>
                          </View>
                      ))
                  ) : (
                      <Text style={styles.noDataText}>No upcoming rides. Start by finding one!</Text>
                  )}
                  <TouchableOpacity style={styles.secondaryButton} onPress={handleViewAllJourneys}>
                    <Text style={styles.secondaryButtonText}>View All My Journeys</Text>
                  </TouchableOpacity>
                </View>
              </>
          )}

          {/* Driver-specific UI sections */}
          {userRole === "driver" && (
              <>
                {/* Offer a Ride Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Offer a Ride</Text>
                  <TouchableOpacity style={styles.primaryButton} onPress={handlePostNewRide}>
                    <Text style={styles.primaryButtonText}>Post a New Ride</Text>
                  </TouchableOpacity>
                </View>

                {/* Pending Ride Requests Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Pending Ride Requests</Text>
                  {pendingRequests.length > 0 ? (
                      pendingRequests.map((ride) => ( // Display next 1-2 pending requests from query
                          <View key={ride.id} style={styles.rideSummaryCard}>
                            <Text style={styles.rideSummaryText}>
                              <Text style={styles.boldText}>From:</Text> {ride.pickup}
                            </Text>
                            <Text style={styles.rideSummaryText}>
                              <Text style={styles.boldText}>To:</Text> {ride.drop}
                            </Text>
                            <Text style={styles.rideSummaryText}>
                              <Text style={styles.boldText}>On:</Text> {new Date(ride.timestamp.toDate()).toLocaleDateString()} at {ride.time}
                            </Text>
                            <Text style={styles.rideSummaryText}>
                              <Text style={styles.boldText}>Status:</Text> Awaiting Passenger
                            </Text>
                          </View>
                      ))
                  ) : (
                      <Text style={styles.noDataText}>No pending ride requests. Post a new ride!</Text>
                  )}
                  <TouchableOpacity style={styles.secondaryButton} onPress={handleViewAllJourneys}>
                    <Text style={styles.secondaryButtonText}>View All My Posted Rides</Text>
                  </TouchableOpacity>
                </View>
                  <View style={styles.container}>
                      <Text style={styles.title}>Driver Dashboard</Text>

                      <View style={styles.switchContainer}>
                          <Text style={styles.label}>{isOnline ? 'You are Online' : 'You are Offline'}</Text>
                          <Switch
                              trackColor={{ false: "#767577", true: "#81b0ff" }}
                              thumbColor={isOnline ? "#f5dd4b" : "#f4f3f4"}
                              onValueChange={toggleOnlineStatus}
                              value={isOnline}
                          />
                      </View>

                      <Text style={styles.info}>
                          Toggle the switch to start or stop sharing your location with customers.
                      </Text>

                      {/* You can add other profile options here, like "Edit Profile", "Logout", etc. */}
                  </View>
              </>
          )}

          {/* Logout Button (available for both roles) */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

// --- StyleSheet for component styling ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light background for the screen
  },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    profileButton: {
        padding: 4,
    },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Add more padding at the bottom for better scroll experience
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Subtle shadow
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#007AFF', // Vibrant Blue
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0', // Light grey
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  rideSummaryCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5, // Emphasize with a color bar
    borderLeftColor: '#007AFF', // Blue bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  rideSummaryText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#222',
  },
  noDataText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545', // Red for danger/logout
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    label: {
        fontSize: 18,
        marginRight: 10,
    },
    info: {
        marginTop: 20,
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
        paddingHorizontal: 20,
    },
});