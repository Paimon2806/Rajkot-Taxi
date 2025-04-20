import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { signIn } from "../services/authService";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      Alert.alert("Success", "Logged in successfully!");
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Login</Text>

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
        <Button title="Login" onPress={handleLogin} />
      </View>

      <Button title="Don't have an account? Sign Up" onPress={() => router.push("/signup")} />
    </View>
  );
}
