import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function TabLayout() {
    const { user, isLoading } = useAuth();

    // If the user is not authenticated, redirect to the login page.
    if (!isLoading && !user) {
        return <Redirect href="/(auth)/login" />;
    }

    // Render the tab navigator if the user is authenticated.
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
                    tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="my-accepted-rides"
                options={{
                    title: "My Accepted Rides",
                    tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}