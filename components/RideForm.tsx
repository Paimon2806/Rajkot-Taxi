import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableOpacity,
} from "react-native";
import {
    TextInput,
    Button,
    Text,
    useTheme,
    Card,
    SegmentedButtons,
} from "react-native-paper";
import Autocomplete from "react-native-autocomplete-input";
import { MotiView } from 'moti';

const cities = ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"];

export default function RideForm({ onSubmit, isSubmitting }) {
    const theme = useTheme();
    const [pickup, setPickup] = useState("");
    const [drop, setDrop] = useState("");
    const [filteredPickupCities, setFilteredPickupCities] = useState([]);
    const [filteredDropCities, setFilteredDropCities] = useState([]);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [price, setPrice] = useState("");
    const [carType, setCarType] = useState("");
    const [tripType, setTripType] = useState('One Way'); // Default to One Way
    const [description, setDescription] = useState("");

    const handlePickupChange = (text) => {
        setPickup(text);
        setFilteredPickupCities(text ? cities.filter((city) => city.toLowerCase().includes(text.toLowerCase())) : []);
    };

    const handleDropChange = (text) => {
        setDrop(text);
        setFilteredDropCities(text ? cities.filter((city) => city.toLowerCase().includes(text.toLowerCase())) : []);
    };

    const handleSubmit = () => {
        if (!pickup || !drop || !date || !time || !price || !carType || !tripType || !description) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }
        if (pickup === drop) {
            Alert.alert("Invalid Route", "Pickup and drop-off cannot be the same.");
            return;
        }
        onSubmit({ pickup, drop, date, time, price, carType, tripType, description });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollContainer: {
            flexGrow: 1,
            justifyContent: "center",
            padding: 8,
        },
        card: {
            padding: 8,
        },
        title: {
            marginBottom: 24,
            textAlign: "center",
        },
        input: {
            paddingHorizontal: 12,
            height: 50,
            borderWidth: 1,
            borderColor: "#cbd8e0",
            borderRadius: 8,
            fontSize: 16,
            marginBottom: 16,
        },
        textInput: {
            marginBottom: 16,
        },
        autoInputContainer: {
            borderWidth: 0,
        },
        suggestionContainer: {
            borderRadius: 8,
            marginTop: -10,
            marginBottom: 10,
            elevation: 3,
            zIndex: 1,
        },
        suggestion: {
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            fontSize: 16,
        },
        button: {
            marginTop: 10,
            paddingVertical: 4,
        },
        label: {
            fontSize: 16,
            marginBottom: 8,
            marginTop: 16,
            color: theme.colors.onSurface,
        },
        segmentedButtons: {
            marginBottom: 16,
        },
        descriptionInput: {
            minHeight: 100,
            textAlignVertical: 'top',
        },
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleLarge" style={styles.title}>Ride Details</Text>

                            <Autocomplete
                                data={filteredPickupCities}
                                value={pickup}
                                onChangeText={handlePickupChange}
                                placeholder="Enter pickup city"
                                flatListProps={{
                                    keyExtractor: (_, idx) => idx.toString(),
                                    renderItem: ({ item }) => (
                                        <TouchableOpacity onPress={() => { setPickup(item); setFilteredPickupCities([]); }}>
                                            <Text style={styles.suggestion}>{item}</Text>
                                        </TouchableOpacity>
                                    ),
                                }}
                                style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                                inputContainerStyle={styles.autoInputContainer}
                                listContainerStyle={styles.suggestionContainer}
                            />

                            <Autocomplete
                                data={filteredDropCities}
                                value={drop}
                                onChangeText={handleDropChange}
                                placeholder="Enter drop-off city"
                                flatListProps={{
                                    keyExtractor: (_, idx) => idx.toString(),
                                    renderItem: ({ item }) => (
                                        <TouchableOpacity onPress={() => { setDrop(item); setFilteredDropCities([]); }}>
                                            <Text style={styles.suggestion}>{item}</Text>
                                        </TouchableOpacity>
                                    ),
                                }}
                                style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
                                inputContainerStyle={styles.autoInputContainer}
                                listContainerStyle={styles.suggestionContainer}
                            />

                            <TextInput
                                label="Date"
                                placeholder="YYYY-MM-DD"
                                value={date}
                                onChangeText={setDate}
                                style={styles.textInput}
                            />

                            <TextInput
                                label="Time"
                                placeholder="HH:MM AM/PM"
                                value={time}
                                onChangeText={setTime}
                                style={styles.textInput}
                            />

                            <TextInput
                                label="Car Type"
                                placeholder="e.g., Sedan, SUV"
                                value={carType}
                                onChangeText={setCarType}
                                style={styles.textInput}
                            />

                            <Text style={styles.label}>Trip Type</Text>
                            <SegmentedButtons
                                value={tripType}
                                onValueChange={setTripType}
                                buttons={[
                                    { value: 'One Way', label: 'One Way' },
                                    { value: 'Round Trip', label: 'Round Trip' },
                                ]}
                                style={styles.segmentedButtons}
                            />

                            <TextInput
                                label="Price (₹)"
                                placeholder="Enter fare"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                style={styles.textInput}
                            />

                            <TextInput
                                label="Description"
                                placeholder="Any specific requirements or details?"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                style={[styles.textInput, styles.descriptionInput]}
                            />

                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                style={styles.button}
                            >
                                Post Ride
                            </Button>
                        </Card.Content>
                    </Card>
                </MotiView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}