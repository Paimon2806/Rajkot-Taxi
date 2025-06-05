// src/app/_layout.tsx

import React from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';

// This component uses the auth context and handles navigation logic
function RootLayoutNav() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    // Protect routes based on authentication status
    React.useEffect(() => {
        if (isLoading) return;

        // Check the first segment to determine the group
        // Using type assertion to fix TypeScript error
        const inAuthGroup = segments[0] as string === '(auth)';

        if (user && inAuthGroup) {
            // User is signed in but on an auth screen - redirect to home
            router.replace('/tabs/home');
        } else if (!user && !inAuthGroup && segments[0] !== '_sitemap') {
            // User is not signed in and not on an auth screen - redirect to login
            router.replace('/login');
        }
    }, [user, isLoading, segments, router]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498DB" />
            </View>
        );
    }

    return <Slot />;
}

// Main layout component that provides the auth context
export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.fullScreen}>
            <SafeAreaProvider>
                <AuthProvider>
                    <RootLayoutNav />
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
    fullScreen: {
        flex: 1,
    },
});