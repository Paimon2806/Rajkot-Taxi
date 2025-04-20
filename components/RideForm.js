import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Animated,
} from "react-native";
import Autocomplete from "react-native-autocomplete-input";

const cities = ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"];

export default function RideForm({ onSubmit }) {
    const [pickup, setPickup] = useState("");
    const [drop, setDrop] = useState("");
    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredDropCities, setFilteredDropCities] = useState([]);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [price, setPrice] = useState("");

    // Animated value for fade-in effect
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handlePickupChange = (text) => {
        setPickup(text);
        setFilteredCities(text ? cities.filter((city) => city.toLowerCase().includes(text.toLowerCase())) : []);
    };

    const handleDropChange = (text) => {
        setDrop(text);
        setFilteredDropCities(text ? cities.filter((city) => city.toLowerCase().includes(text.toLowerCase())) : []);
    };

    const handleSubmit = () => {
        if (!pickup || !drop || !date || !time || !price) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }
        if (pickup === drop) {
            Alert.alert("Invalid Route", "Pickup and drop-off cannot be the same.");
            return;
        }
        onSubmit({ pickup, drop, date, time, price });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>Post a Ride</Text>

                    {/* Pickup */}
                    <Text style={styles.label}>Pickup Location</Text>
                    <Autocomplete
                        data={filteredCities}
                        value={pickup}
                        onChangeText={handlePickupChange}
                        placeholder="Enter pickup city"
                        flatListProps={{
                            keyExtractor: (_, idx) => idx.toString(),
                            scrollEnabled: false,
                            renderItem: ({ item }) => (
                                <TouchableOpacity onPress={() => { setPickup(item); setFilteredCities([]); }}>
                                    <Text style={styles.suggestion}>{item}</Text>
                                </TouchableOpacity>
                            ),
                        }}
                        inputContainerStyle={styles.autoInputContainer}
                        listContainerStyle={styles.suggestionContainer}
                        style={styles.input}
                    />

                    {/* Drop-off */}
                    <Text style={styles.label}>Drop-off Location</Text>
                    <Autocomplete
                        data={filteredDropCities}
                        value={drop}
                        onChangeText={handleDropChange}
                        placeholder="Enter drop-off city"
                        flatListProps={{
                            keyExtractor: (_, idx) => idx.toString(),
                            scrollEnabled: false,
                            renderItem: ({ item }) => (
                                <TouchableOpacity onPress={() => { setDrop(item); setFilteredDropCities([]); }}>
                                    <Text style={styles.suggestion}>{item}</Text>
                                </TouchableOpacity>
                            ),
                        }}
                        inputContainerStyle={styles.autoInputContainer}
                        listContainerStyle={styles.suggestionContainer}
                        style={styles.input}
                    />

                    {/* Date */}
                    <Text style={styles.label}>Date</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={date}
                        onChangeText={setDate}
                    />

                    {/* Time */}
                    <Text style={styles.label}>Time</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="HH:MM AM/PM"
                        value={time}
                        onChangeText={setTime}
                    />

                    {/* Price */}
                    <Text style={styles.label}>Price (₹)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter fare"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
                        <Text style={styles.buttonText}>Post Ride</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#eaf6ff", // soft pastel blue background
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0077cc",
        marginBottom: 24,
        textAlign: "center",
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444",
        marginBottom: 6,
        marginTop: 10,
    },
    input: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#cbd8e0",
        borderRadius: 12,
        backgroundColor: "#f7fbff",
        fontSize: 16,
        marginBottom: 16,
    },
    autoInputContainer: {
        borderWidth: 0,
        padding: 0,
    },
    suggestionContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginTop: -10,
        marginBottom: 10,
        elevation: 3,
        zIndex: 999,
    },
    suggestion: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        fontSize: 16,
    },
    button: {
        backgroundColor: "#4da5ff", // soft blue
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#4da5ff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
