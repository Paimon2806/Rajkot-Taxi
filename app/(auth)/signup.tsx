// src/app/signup.tsx (or your path to SignUpScreen.tsx)

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
// import { Picker } from '@react-native-picker/picker'; // <--- REMOVED THIS IMPORT
import { signUp } from "../../services/authService";
import { useRouter } from "expo-router";

// Firebase error type is less strictly defined in the Web SDK for client-side casting
interface FirebaseError extends Error {
    code?: string;
}

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<string>(""); // Initial state is empty string for no selection
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
        if (!role) { // This still works for "" as "" is falsy
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
            router.replace("/login");
        } catch (err) {
            handleAuthError(err as FirebaseError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Sign Up</Text>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        placeholderTextColor="#888"
                        editable={!loading}
                    />

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
                        autoComplete="new-password"
                        placeholderTextColor="#888"
                        editable={!loading}
                    />

                    <Text style={styles.label}>Role</Text>
                    {/* <--- START OF RADIO BUTTON IMPLEMENTATION ---/> */}
                    <View style={styles.roleSelectionContainer}>
                        <TouchableOpacity
                            style={[
                                styles.roleOption,
                                role === "driver" && styles.roleOptionSelected,
                                loading && styles.roleOptionDisabled
                            ]}
                            onPress={() => setRole("driver")}
                            disabled={loading}
                        >
                            <Text style={[
                                styles.roleOptionText,
                                role === "driver" && styles.roleOptionTextSelected,
                                loading && styles.roleOptionTextDisabled
                            ]}>Driver</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.roleOption,
                                role === "passenger" && styles.roleOptionSelected,
                                loading && styles.roleOptionDisabled
                            ]}
                            onPress={() => setRole("passenger")}
                            disabled={loading}
                        >
                            <Text style={[
                                styles.roleOptionText,
                                role === "passenger" && styles.roleOptionTextSelected,
                                loading && styles.roleOptionTextDisabled
                            ]}>Passenger</Text>
                        </TouchableOpacity>
                    </View>
                    {/* <--- END OF RADIO BUTTON IMPLEMENTATION ---/> */}

                    {loading ? (
                        <ActivityIndicator size="large" color={styles.button.backgroundColor} style={styles.button} />
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSignUp}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>OR</Text>
                        <View style={styles.separatorLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push("/login")}
                        disabled={loading}
                    >
                        <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
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
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 25,
        textAlign: "center",
        color: '#2C3E50',
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
        marginBottom: 18,
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
        marginBottom: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
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
        color: '#7F8C8D',
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
        color: '#E74C3C',
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    // <--- NEW STYLES FOR RADIO BUTTONS ---/>
    roleSelectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 18,
        backgroundColor: '#F0F3F7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDE2E8',
        overflow: 'hidden', // Ensures inner borders/backgrounds clip correctly
    },
    roleOption: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        // Optional: add a subtle right border between options if desired
        // borderRightWidth: 1,
        // borderRightColor: '#DDE2E8',
    },
    // Remove border from the last option if you add it above
    // 'roleOption:last-child': { borderRightWidth: 0 },
    roleOptionSelected: {
        backgroundColor: '#3498DB', // Highlight color
        borderColor: '#3498DB', // Ensure border matches
    },
    roleOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2C3E50',
    },
    roleOptionTextSelected: {
        color: '#FFFFFF', // Text color when selected
    },
    roleOptionDisabled: {
        opacity: 0.6, // Dim when disabled
    },
    roleOptionTextDisabled: {
        color: '#888', // Dim text when disabled
    },
    // <--- END NEW STYLES ---/>

    // REMOVED PICKER STYLES:
    // pickerContainer: {
    //     borderWidth: 1,
    //     borderColor: '#DDE2E8',
    //     borderRadius: 8,
    //     marginBottom: 18,
    //     overflow: 'hidden',
    //     backgroundColor: '#F0F3F7',
    //     height: 50,
    //     justifyContent: 'center',
    // },
    // picker: {
    //     height: 50,
    //     width: '100%',
    //     color: '#2C3E50',
    // },
});