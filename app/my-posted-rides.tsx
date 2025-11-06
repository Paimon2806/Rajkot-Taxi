import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { getAuth } from "firebase/auth";
import RideCard from "../components/RideCard";
import { Appbar, Text, useTheme, Card, Chip, Button } from "react-native-paper";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

interface Ride {
  id: string;
  uid: string;
  pickup: string;
  drop: string;
  status: string;
  assignedName: string | null;
  timestamp: Timestamp;
  price?: number | string;
  username?: string;
  carType?: string;
  tripType?: string;
  description?: string;
  date?: string;
  time?: string;
  assignedTo?: string | null;
}

export default function MyPostedRidesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const auth = getAuth();
  const user = auth.currentUser;

  const [myPostedRides, setMyPostedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyPostedRides = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const ridesQuery = query(
        collection(db, "rides"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(ridesQuery);
      const rides = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          pickup: data.pickup,
          drop: data.drop,
          status: data.status || "pending",
          assignedName: data.assignedName || null,
          timestamp: data.timestamp,
          price: data.price || null,
          username: data.username || null,
          carType: data.carType || null,
          tripType: data.tripType || null,
          description: data.description || null,
          date: data.date || null,
          time: data.time || null,
          assignedTo: data.assignedTo || null,
        } as Ride;
      });
      setMyPostedRides(rides);
    } catch (error) {
      console.error("Error fetching my posted rides: ", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyPostedRides();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyPostedRides();
  };

  const handleRidePress = (rideId: string) => {
    router.push(`/ride/${rideId}`);
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case "pending":
        return theme.colors.warning; // Assuming you add this to your theme
      case "accepted":
        return theme.colors.accent;
      case "in_progress":
        return theme.colors.info;
      case "completed":
        return theme.colors.onSurfaceVariant;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const renderRideItem = ({ item }: { item: Ride }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500 }}
      style={styles.motiItemContainer}
    >
      <RideCard
        rideId={item.id}
        uid={item.uid}
        pickup={item.pickup}
        drop={item.drop}
        price={item.price}
        date={item.date}
        time={item.time}
        username={item.username}
        status={item.status}
        assignedTo={item.assignedTo}
        carType={item.carType}
        tripType={item.tripType}
        description={item.description}
      />
    </MotiView>
  );

  if (loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="My Posted Rides" />
      </Appbar.Header>
      <FlatList
        data={myPostedRides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="clipboard-outline"
              size={60}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="headlineSmall"
              style={{ color: theme.colors.onSurface, textAlign: "center" }}
            >
              No rides posted yet
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Post a new ride to see it here.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push("/ridepost")}
              style={{ marginTop: 16 }}
            >
              Post New Ride
            </Button>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  motiItemContainer: {
    marginBottom: 16,
  },
  rideItem: {
    elevation: 2,
  },
  rideItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
});
