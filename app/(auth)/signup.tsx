import React, { useState } from "react";
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import {
    TextInput,
    Button,
    Text,
    useTheme,
    Card,
    SegmentedButtons,
} from "react-native-paper";
import { MotiView } from 'moti';
import { signUp } from "../../services/authService";
import { useRouter } from "expo-router";

interface FirebaseError extends Error {
    code?: string;
}

export default function SignUpScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuthError = (authError: FirebaseError | any) => {
        setLoading(false);
        let friendlyMessage = "An unexpected error occurred during signup. Please try again.";

        if (authError.code) {
            switch (authError.code) {
                case 'auth/email-already-in-use':
                    friendlyMessage = 'This email address is already in use. Please log in or use a different email.';
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/weak-password':
                    friendlyMessage = 'Password is too weak. Please choose a stronger password (minimum 6 characters).';
                    break;
                case 'auth/operation-not-allowed':
                    friendlyMessage = 'Email/password accounts are not enabled. Please contact support.';
                    break;
                default:
                    friendlyMessage = authError.message || friendlyMessage;
            }
        } else if (authError instanceof Error) {
            friendlyMessage = authError.message;
        }
        setError(friendlyMessage);
        console.error('Sign Up Error:', authError);
    };

    const validateInputs = () => {
        if (!name.trim()) {
            setError("Please enter your name.");
            return false;
        }
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
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return false;
        }
        if (!role) {
            setError("Please select your role (Driver or Passenger).");
            return false;
        }

        setError(null);
        return true;
    };

    const handleSignUp = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        setError(null);
        try {
            await signUp(email.trim(), password, name.trim(), role);
            Alert.alert("Success", "Account created successfully! Please log in.");
            router.replace("/(auth)/login");
        } catch (err) {
            handleAuthError(err as FirebaseError);
        } finally {
            setLoading(false);
        }
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
                                Create Account
                            </Text>

                            {error && <Text style={styles.errorText}>{error}</Text>}

                            <TextInput
                                label="Name"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                style={styles.input}
                                editable={!loading}
                            />

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
                                autoComplete="new-password"
                                style={styles.input}
                                editable={!loading}
                            />

                            <Text style={styles.label}>I am a...</Text>
                            <SegmentedButtons
                                value={role}
                                onValueChange={setRole}
                                buttons={[
                                    { value: 'driver', label: 'Driver' },
                                    { value: 'passenger', label: 'Passenger' },
                                ]}
                                style={styles.segmentedButtons}
                            />

                            <MotiView
                                from={{ scale: 1, opacity: 1 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileTap={{ scale: 0.98, opacity: 0.95 }}
                                transition={{ type: 'timing', duration: 150 }}
                            >
                                <Button
                                    mode="contained"
                                    onPress={handleSignUp}
                                    loading={loading}
                                    disabled={loading}
                                    style={styles.button}
                                >
                                    Sign Up
                                </Button>
                            </MotiView>

                            <View style={styles.separatorContainer}>
                                <View style={[styles.separatorLine, { backgroundColor: theme.colors.outline }]} />
                                <Text style={{ color: theme.colors.onSurfaceVariant }}>OR</Text>
                                <View style={[styles.separatorLine, { backgroundColor: theme.colors.outline }]} />
                            </View>

                            <Button
                                mode="outlined"
                                onPress={() => router.push('login')}
                                disabled={loading}
                            >
                                Already have an account? Login
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
    label: {
        marginBottom: 8,
        marginLeft: 4,
        fontSize: 16,
    },
    input: {
        marginBottom: 16,
    },
    segmentedButtons: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        paddingVertical: 4,
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