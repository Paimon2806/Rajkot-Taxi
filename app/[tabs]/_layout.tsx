import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Assuming you use Ionicons for icons

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ridepost"
                options={{
                    title: "Post Ride",
                    tabBarIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ridelist"
                options={{
                    title: "Ride List",
                    tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />, // Changed icon for clarity
                }}
            />
            <Tabs.Screen
                name="my-accepted-rides" // This maps to app/(tabs)/my-accepted-rides.tsx
                options={{
                    title: "My Accepted Rides",
                    tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle" size={size} color={color} />, // A clear icon for accepted items
                }}
            />
        </Tabs>
    );
}