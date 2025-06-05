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
    Image,
} from "react-native";
import { sendPasswordReset } from "../../services/authService";
import { useRouter } from "expo-router";

// Firebase error type is less strictly defined in the Web SDK for client-side casting
interface FirebaseError extends Error {
    code?: string;
}

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleAuthError = (authError: FirebaseError | any) => {
        setLoading(false);
        let friendlyMessage = "An unexpected error occurred. Please try again.";

        if (authError.code) {
            switch (authError.code) {
                case 'auth/invalid-email':
                    friendlyMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/user-not-found':
                    // For security, we don't want to reveal if an email exists or not
                    // So we'll show a generic success message instead in the UI
                    setSuccess(true);
                    return;
                case 'auth/too-many-requests':
                    friendlyMessage = 'Too many requests. Please try again later.';
                    break;
                default:
                    friendlyMessage = authError.message || friendlyMessage;
            }
        } else if (authError instanceof Error) {
            friendlyMessage = authError.message;
        }

        setError(friendlyMessage);
        console.error('Password Reset Error:', authError);
    };

    const validateEmail = () => {
        if (!email.trim()) {
            setError("Please enter your email address.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }

        setError(null);
        return true;
    };

    const handlePasswordReset = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await sendPasswordReset(email.trim());
            setSuccess(true);
        } catch (err) {
            handleAuthError(err as FirebaseError);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace("/login");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Reset Password</Text>

                    {!success ? (
                        <>
                            <Text style={styles.subtitle}>
                                Enter your email address and we'll send you a link to reset your password.
                            </Text>

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

                            {loading ? (
                                <ActivityIndicator size="large" color={styles.button.backgroundColor} style={styles.button} />
                            ) : (
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handlePasswordReset}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>Send Reset Link</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <View style={styles.successContainer}>
                            <View style={styles.successIconContainer}>
                                <Text style={styles.successIcon}>✓</Text>
                            </View>
                            <Text style={styles.successTitle}>Check Your Email</Text>
                            <Text style={styles.successMessage}>
                                If an account exists for {email}, we've sent a password reset link to that email address.
                            </Text>
                            <Text style={styles.successHint}>
                                Check your spam folder if you don't see it in your inbox.
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackToLogin}
                        disabled={loading}
                    >
                        <Text style={styles.backButtonText}>Back to Login</Text>
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
        backgroundColor: '#F7F9FC',
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
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: '#2C3E50',
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: '#7F8C8D',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
        marginLeft: 2,
    },
    input: {
        height: 50,
        backgroundColor: '#F0F3F7',
        borderWidth: 1,
        borderColor: '#DDE2E8',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 25,
        fontSize: 16,
        color: '#2C3E50',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#3498DB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        alignSelf: 'center',
        paddingVertical: 12,
    },
    backButtonText: {
        color: '#3498DB',
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: '#E74C3C',
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    successIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successIcon: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: 'bold',
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#7F8C8D',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    successHint: {
        fontSize: 14,
        textAlign: 'center',
        color: '#95A5A6',
        fontStyle: 'italic',
    },
});
