import React from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from '../constants/theme';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';

function RootLayoutNav() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    React.useEffect(() => {
        if (isLoading) return;
        const inAuthGroup = segments[0] === '(auth)';
        if (user && inAuthGroup) {
            router.replace('/(tabs)/home');
        } else if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        }
    }, [user, isLoading, segments, router]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <Slot />;
}

function ThemedApp() {
    const { themeMode } = useThemeContext();
    const systemColorScheme = useColorScheme();
    const theme = themeMode === 'system'
        ? (systemColorScheme === 'dark' ? darkTheme : lightTheme)
        : (themeMode === 'dark' ? darkTheme : lightTheme);

    return (
        <PaperProvider theme={theme}>
            <RootLayoutNav />
        </PaperProvider>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_700Bold,
    });

    React.useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={styles.fullScreen}>
            <SafeAreaProvider>
                <AuthProvider>
                    <ThemeProvider>
                        <ThemedApp />
                    </ThemeProvider>
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
    },
    fullScreen: {
        flex: 1,
    },
});