import React, { useState } from "react";
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { TextInput, Button, Text, useTheme, Card } from "react-native-paper";
import { MotiView } from 'moti';
import { signIn } from "../../services/authService";
import { useRouter } from "expo-router";

interface FirebaseError extends Error {
    code?: string;
}

export default function LoginScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuthError = (authError: FirebaseError | any) => {
        setLoading(false);
        let friendlyMessage = "An unexpected error occurred. Please try again.";

        if (authError.code) {
            switch (authError.code) {
                case 'auth/invalid-email':
                case 'auth/invalid-credential':
                    friendlyMessage = 'Invalid email or password. Please check your credentials.';
                    break;
                case 'auth/user-not-found':
                    friendlyMessage = 'No user found with this email. Please sign up or check your email.';
                    break;
                case 'auth/wrong-password':
                    friendlyMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    friendlyMessage = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
                    break;
                case 'auth/user-disabled':
                    friendlyMessage = 'This user account has been disabled.';
                    break;
                default:
                    friendlyMessage = authError.message || friendlyMessage;
            }
        } else if (authError instanceof Error) {
            friendlyMessage = authError.message;
        }
        setError(friendlyMessage);
        console.error('Auth Error:', authError);
    };

    const validateInputs = () => {
        if (!email.trim()) {
            setError("Please enter your email address.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }
        if (!password.trim()) {
            setError("Please enter your password.");
            return false;
        }
        setError(null);
        return true;
    };

    const handleLogin = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        setError(null);
        try {
            await signIn(email.trim(), password);
            router.replace("/(tabs)/home");
        } catch (err) {
            handleAuthError(err as FirebaseError);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = () => {
        router.push("/(auth)/forgotpassword");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <MotiView
                    from={{ opacity: 0, translateY: 50 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                    style={styles.container}
                >
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
                                Welcome Back
                            </Text>

                            {error && <Text style={styles.errorText}>{error}</Text>}

                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={(text) => setEmail(text.toLowerCase())}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                style={styles.input}
                                editable={!loading}
                            />

                            <TextInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="current-password"
                                style={styles.input}
                                editable={!loading}
                            />

                            <Button
                                mode="contained"
                                onPress={handleLogin}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                            >
                                Login
                            </Button>

                            <Button
                                onPress={handlePasswordReset}
                                disabled={loading}
                                style={styles.forgotPasswordButton}
                            >
                                Forgot Password?
                            </Button>

                            <View style={styles.separatorContainer}>
                                <View style={[styles.separatorLine, { backgroundColor: theme.colors.outline }]} />
                                <Text style={{ color: theme.colors.onSurfaceVariant }}>OR</Text>
                                <View style={[styles.separatorLine, { backgroundColor: theme.colors.outline }]} />
                            </View>

                            <Button
                                mode="outlined"
                                onPress={() => router.push("/(auth)/signup")}
                                disabled={loading}
                            >
                                Don't have an account? Sign Up
                            </Button>
                        </Card.Content>
                    </Card>
                </MotiView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    card: {
        padding: 8,
    },
    title: {
        marginBottom: 24,
        textAlign: "center",
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        paddingVertical: 4,
    },
    forgotPasswordButton: {
        marginTop: 8,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        marginHorizontal: 8,
    },
    errorText: {
        color: '#E74C3C',
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
});