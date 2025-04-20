import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { signUp } from "../services/authService";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");

    const handleSignUp = async () => {
        try {
            await signUp(email, password, name , role);
            Alert.alert("Success", "Account created successfully!");
            router.push("/login"); // Navigate to login screen
        } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "An unknown error occurred");
        }
    };

    return (
        <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Sign Up</Text>

            <View style={{ marginBottom: 10 }}>
                <Text>Name</Text>
                <TextInput
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 10,
                        borderRadius: 5,
                    }}
                />
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text>Email</Text>
                <TextInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 10,
                        borderRadius: 5,
                    }}
                />
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text>Password</Text>
                <TextInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 10,
                        borderRadius: 5,
                    }}
                />
            </View>

            <View style={{ marginBottom: 10 }}>
                <Text>Role</Text>
                <TextInput
                    placeholder="Driver or passager"
                    value={role}
                    onChangeText={setRole}
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 10,
                        borderRadius: 5,
                    }}
                />
            </View>

            <View style={{ marginBottom: 10 }}>
                <Button title="Sign Up" onPress={handleSignUp} />
            </View>

            <Button title="Already have an account? Login" onPress={() => router.push("/login")} />
        </View>
    );
}
