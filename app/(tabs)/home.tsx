import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import {
    Text,
    Button,
    Card,
    useTheme,
    Avatar,
    Switch,
    Divider,
} from "react-native-paper";
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
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { LocationService } from "../../services/LocationService";
import { MotiView } from 'moti';

interface Ride {
  id: string;
  from: string;
  to: string;
  date?: string;
  time?: string;
  price?: number | string;
  carType?: string;
  tripType?: string;
  description?: string;
  uid: string;
  username: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  assignedName?: string | null;
  timestamp: Timestamp;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, userName, userRole, isLoading } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  const navigateToProfile = () => {
    router.push('/profile');
  };

  const toggleOnlineStatus = (value: boolean) => {
    setIsOnline(value);
    if (value) {
      LocationService.startLocationTracking();
    } else {
      LocationService.stopLocationTracking();
    }
  };

  if (isLoading) {
    return (
        <View style={[styles.centeredContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
    );
  }

  const renderPassengerDashboard = () => (
    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
      <Card style={styles.card}>
        <Card.Title
          title="Find Your Next Ride"
          left={(props) => <Avatar.Icon {...props} icon="car-search" />}
        />
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => router.push('ridelist')}
            style={styles.button}
          >
            Browse Available Rides
          </Button>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title
          title="My Journeys"
          left={(props) => <Avatar.Icon {...props} icon="map-marker-path" />}
        />
        <Card.Content>
          <Button
            mode="outlined"
            onPress={() => router.push('my-accepted-rides')}
          >
            View My Accepted Rides
          </Button>
        </Card.Content>
      </Card>
    </MotiView>
  );

  const renderDriverDashboard = () => (
    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
      <Card style={styles.card}>
        <Card.Title
          title="Driver Mode"
          left={(props) => <Avatar.Icon {...props} icon={isOnline ? "car-connected" : "car-off"} />}
        />
        <Card.Content>
          <View style={styles.switchContainer}>
            <Text variant="bodyLarge">{isOnline ? 'You are Online' : 'You are Offline'}</Text>
            <Switch value={isOnline} onValueChange={toggleOnlineStatus} />
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Toggle to start or stop sharing your location.
          </Text>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title
          title="Manage Your Rides"
          left={(props) => <Avatar.Icon {...props} icon="steering" />}
        />
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => router.push('ridepost')}
            style={styles.button}
          >
            Post a New Ride
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('my-accepted-rides')}
            style={{marginTop: 10}}
          >
            View Accepted Rides
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/my-posted-rides')}
            style={{marginTop: 10}}
          >
            View My Posted Rides
          </Button>
        </Card.Content>
      </Card>
    </MotiView>
  );

  return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text variant="headlineLarge" style={{ color: theme.colors.onBackground }}>
            Welcome, {userName}!
          </Text>
          <Ionicons
            name="person-circle-outline"
            size={32}
            color={theme.colors.primary}
            onPress={navigateToProfile}
          />
        </View>
        <Divider style={styles.divider} />

        {userRole === 'passenger' ? renderPassengerDashboard() : renderDriverDashboard()}

      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  button: {
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});