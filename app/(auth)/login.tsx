

import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { signIn, sendPasswordReset } from "../../services/authService";
import { useRouter } from "expo-router";


interface FirebaseError extends Error {
    code?: string;
}

export default function LoginScreen() {
    const router = useRouter();
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

    const validateInputs = (isForPasswordReset = false) => {
        if (!email.trim()) {
            setError("Please enter your email address.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }
        if (!isForPasswordReset && !password.trim()) {
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
            // Alert.alert("Success", "Logged in successfully!");
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
            style={styles.keyboardAvoidingContainer}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Login</Text>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={(text) => setEmail(text.toLowerCase())}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        placeholderTextColor="#888"
                        editable={!loading}
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="current-password"
                        placeholderTextColor="#888"
                        editable={!loading}
                    />

                    {loading ? (
                        <ActivityIndicator size="large" color={styles.button.backgroundColor} style={styles.button} />
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={handlePasswordReset}
                        disabled={loading}
                    >
                        <Text style={styles.linkButtonText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>OR</Text>
                        <View style={styles.separatorLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push("/signup")}
                        disabled={loading}
                    >
                        <Text style={styles.secondaryButtonText}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: '#F7F9FC', // A light, neutral background
    },
    container: {
        marginHorizontal: 20,
        padding: 25,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 5, // For Android
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 25,
        textAlign: "center",
        color: '#2C3E50', // Dark blue-gray
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
        marginLeft: 2,
    },
    input: {
        height: 50,
        backgroundColor: '#F0F3F7', // Light gray input background
        borderWidth: 1,
        borderColor: '#DDE2E8', // Softer border color
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 18,
        fontSize: 16,
        color: '#2C3E50',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#3498DB', // A pleasant blue
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    linkButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        marginBottom: 20,
    },
    linkButtonText: {
        color: '#3498DB',
        fontSize: 15,
    },
    disabledText: {
        color: '#AAB8C2' // Light gray for disabled text
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#DDE2E8',
    },
    separatorText: {
        marginHorizontal: 10,
        color: '#7F8C8D', // Muted gray
        fontSize: 14,
    },
    secondaryButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3498DB',
    },
    secondaryButtonText: {
        color: '#3498DB',
        fontSize: 17,
        fontWeight: '500',
    },
    errorText: {
        color: '#E74C3C', // A standard error red
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
});