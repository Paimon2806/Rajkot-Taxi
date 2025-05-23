// src/app/_layout.tsx

import React, { useState, useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { observeAuthChanges } from '../services/authService'; // Adjust path if necessary
import { User } from 'firebase/auth'; // Import User type
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Added back
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Added back

export default function RootLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments(); // Gets the current route segments

    useEffect(() => {
        const unsubscribe = observeAuthChanges((authUser) => {
            setUser(authUser);
            setAuthLoading(false);
        });
        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    useEffect(() => {
        if (authLoading) return; // Don't run effect until auth state is determined

        // This logic assumes 'login.tsx' and 'signup.tsx' are directly in the 'app/' directory
        // If you later organize them into a group like 'app/(auth)/login.tsx',
        // you would change 'currentRoute' and 'isAuthRoute' accordingly (e.g., segments[0] === '(auth)')
        const currentRoute = segments[segments.length - 1];
        const isAuthRoute = currentRoute === 'login' || currentRoute === 'signup';

        if (user && isAuthRoute) {
            // User is signed in and on an auth screen (login/signup)
            router.replace('/(tabs)/home'); // Redirect to home
        } else if (!user && !isAuthRoute && segments[0] !== '_sitemap') {
            // User is NOT signed in and NOT on an auth screen (and not the sitemap)
            router.replace('/login'); // Redirect to login
        }
    }, [user, authLoading, segments, router]); // Dependency array for useEffect

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498DB" />
            </View>
        );
    }

    // Renders the active child route, wrapped with necessary providers
    return (
        <GestureHandlerRootView style={styles.fullScreen}>
            <SafeAreaProvider>
                <Slot />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC', // A light, neutral background
    },
    fullScreen: { // New style for the root wrapper
        flex: 1,
    },
});