import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { logout } from "../../services/authService";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  // Define Ride interface
  interface Ride {
      id: string;
      date: string;
      drop: string;
      pickup: string;
      price: string;
      time: string;
  }

  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    fetchRides();
  }, []);

  // Fetch rides from Firestore
  const fetchRides = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "rides"));
      const rideList: Ride[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
          date: data.date || "Unknown",
          pickup: data.pickup || "Unknown",
          drop: data.drop || "Unknown",
          price: data.price || 0,
          time: data.time || "unknown",
        };
      });
      setRides(rideList);
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login"); // ✅ Fixed path
} catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (

    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.title}>Welcome to the Taxi App</Text>
        {/*<Button title="Post a Ride" onPress={() => { router.push("/(tabs)/ridepost"); }} />*/}
      {/*  <Text style={{ fontSize: 20, fontWeight: "bold" }}>Available Rides</Text>*/}
      {/*<FlatList*/}
      {/*  data={rides}*/}
      {/*  keyExtractor={(item) => item.id}*/}
      {/*  renderItem={({ item }) => (*/}
      {/*    <TouchableOpacity*/}
      {/*      style={{*/}
      {/*        padding: 15,*/}
      {/*        marginVertical: 10,*/}
      {/*        backgroundColor: "#f1f1f1",*/}
      {/*        borderRadius: 8,*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      <Text style={{ fontWeight: "bold" }}>{item.pickup} → {item.drop}</Text>*/}
      {/*      <Text>Fare: ₹{item.price}</Text>*/}
      {/*      <Text>Date: {item.date}</Text>*/}
      {/*        <Text>Time: {item.time}</Text>*/}
      {/*    </TouchableOpacity>*/}
      {/*  )}*/}
      {/*/>*/}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});


