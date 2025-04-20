import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
                    tabBarIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
