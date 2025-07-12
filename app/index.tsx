import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
    const { user, isLoading } = useAuth();


    if (isLoading) return null;

    // Redirect based on authentication status
    return user ? <Redirect href="/tabs/home" /> : <Redirect href="/login" />;
}
