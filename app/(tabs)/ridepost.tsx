import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    SafeAreaView,
} from "react-native";
import {
    TextInput,
    Button,
    Text,
    useTheme,
    Card,
    SegmentedButtons,
    Appbar,
    Menu,
    Divider,
} from "react-native-paper";
import { MotiView } from 'moti';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from "expo-router";
import { db } from "../../config/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const cities = ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"];

interface RideFormInputs {
    pickup: string;
    drop: string;
    date: string;
    time: string;
    price: string;
    carType: string;
    tripType: 'One Way' | 'Round Trip';
    description: string;
}

export default function RidePost() {
    const router = useRouter();
    const theme = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, formState: { errors }, setValue } = useForm<RideFormInputs>({
        defaultValues: {
            pickup: '',
            drop: '',
            date: '',
            time: '',
            price: '',
            carType: '',
            tripType: 'One Way',
            description: '',
        },
    });

    const [pickupMenuVisible, setPickupMenuVisible] = useState(false);
    const [dropMenuVisible, setDropMenuVisible] = useState(false);
    const [filteredPickupCities, setFilteredPickupCities] = useState<string[]>([]);
    const [filteredDropCities, setFilteredDropCities] = useState<string[]>([]);

    const handlePickupChange = (text: string) => {
        if (text) {
            setFilteredPickupCities(cities.filter((city) => city.toLowerCase().includes(text.toLowerCase())));
            setPickupMenuVisible(true);
        } else {
            setFilteredPickupCities([]);
            setPickupMenuVisible(false);
        }
        setValue('pickup', text);
    };

    const handleDropChange = (text: string) => {
        if (text) {
            setFilteredDropCities(cities.filter((city) => city.toLowerCase().includes(text.toLowerCase())));
            setDropMenuVisible(true);
        } else {
            setFilteredDropCities([]);
            setDropMenuVisible(false);
        }
        setValue('drop', text);
    };

    const onFormSubmit = async (data: RideFormInputs) => {
        if (data.pickup === data.drop) {
            Alert.alert("Invalid Route", "Pickup and drop-off cannot be the same.");
            return;
        }

        setIsSubmitting(true);

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                Alert.alert("Error", "You must be logged in to post a ride.");
                setIsSubmitting(false);
                return;
            }

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const username = userDocSnap.exists() && userDocSnap.data().name
                ? userDocSnap.data().name
                : "Anonymous";

            await addDoc(collection(db, "rides"), {
                ...data,
                uid: user.uid,
                username,
                timestamp: serverTimestamp(),
                assignedTo: null,
                assignedName: null,
                status: "pending",
            });

            Alert.alert("Success", "Ride posted successfully!");
            router.push("/(tabs)/ridelist");

        } catch (error) {
            Alert.alert("Error", "Failed to post ride.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContainer: {
            paddingBottom: 100, // Add padding to the bottom
        },
        card: {
            padding: 8,
            backgroundColor: theme.colors.surface,
        },
        title: {
            marginBottom: 24,
            textAlign: "center",
            color: theme.colors.onSurface,
        },
        textInput: {
            marginBottom: 16,
            backgroundColor: theme.colors.surfaceVariant,
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
        errorText: {
            color: theme.colors.error,
            marginBottom: 8,
            marginTop: -8,
            marginLeft: 12,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="Post a New Ride" />
            </Appbar.Header>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
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

                                <Menu
                                    visible={pickupMenuVisible && filteredPickupCities.length > 0}
                                    onDismiss={() => setPickupMenuVisible(false)}
                                    anchor={
                                        <Controller
                                            control={control}
                                            name="pickup"
                                            rules={{ required: 'Pickup city is required' }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    label="Pickup City"
                                                    style={styles.textInput}
                                                    value={value}
                                                    onBlur={onBlur}
                                                    onChangeText={(text) => {
                                                        onChange(text);
                                                        handlePickupChange(text);
                                                    }}
                                                />
                                            )}
                                        />
                                    }
                                >
                                    {filteredPickupCities.map((city, index) => (
                                        <Menu.Item
                                            key={index}
                                            onPress={() => {
                                                setValue('pickup', city);
                                                setPickupMenuVisible(false);
                                            }}
                                            title={city}
                                        />
                                    ))}
                                </Menu>
                                {errors.pickup && <Text style={styles.errorText}>{errors.pickup.message}</Text>}

                                <Menu
                                    visible={dropMenuVisible && filteredDropCities.length > 0}
                                    onDismiss={() => setDropMenuVisible(false)}
                                    anchor={
                                        <Controller
                                            control={control}
                                            name="drop"
                                            rules={{ required: 'Drop-off city is required' }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    label="Drop-off City"
                                                    style={styles.textInput}
                                                    value={value}
                                                    onBlur={onBlur}
                                                    onChangeText={(text) => {
                                                        onChange(text);
                                                        handleDropChange(text);
                                                    }}
                                                />
                                            )}
                                        />
                                    }
                                >
                                    {filteredDropCities.map((city, index) => (
                                        <Menu.Item
                                            key={index}
                                            onPress={() => {
                                                setValue('drop', city);
                                                setDropMenuVisible(false);
                                            }}
                                            title={city}
                                        />
                                    ))}
                                </Menu>
                                {errors.drop && <Text style={styles.errorText}>{errors.drop.message}</Text>}

                                <Controller
                                    control={control}
                                    name="date"
                                    rules={{ required: 'Date is required' }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Date"
                                            placeholder="YYYY-MM-DD"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            style={styles.textInput}
                                        />
                                    )}
                                />
                                {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}

                                <Controller
                                    control={control}
                                    name="time"
                                    rules={{ required: 'Time is required' }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Time"
                                            placeholder="HH:MM AM/PM"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            style={styles.textInput}
                                        />
                                    )}
                                />
                                {errors.time && <Text style={styles.errorText}>{errors.time.message}</Text>}

                                <Controller
                                    control={control}
                                    name="carType"
                                    rules={{ required: 'Car Type is required' }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Car Type"
                                            placeholder="e.g., Sedan, SUV"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            style={styles.textInput}
                                        />
                                    )}
                                />
                                {errors.carType && <Text style={styles.errorText}>{errors.carType.message}</Text>}

                                <Text style={styles.label}>Trip Type</Text>
                                <Controller
                                    control={control}
                                    name="tripType"
                                    rules={{ required: 'Trip Type is required' }}
                                    render={({ field: { onChange, value } }) => (
                                        <SegmentedButtons
                                            value={value}
                                            onValueChange={onChange}
                                            buttons={[
                                                { value: 'One Way', label: 'One Way' },
                                                { value: 'Round Trip', label: 'Round Trip' },
                                            ]}
                                            style={styles.segmentedButtons}
                                        />
                                    )}
                                />
                                {errors.tripType && <Text style={styles.errorText}>{errors.tripType.message}</Text>}

                                <Controller
                                    control={control}
                                    name="price"
                                    rules={{ required: 'Price is required', pattern: { value: /^[0-9]+$/, message: 'Price must be a number' } }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Price (₹)"
                                            placeholder="Enter fare"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            keyboardType="numeric"
                                            style={styles.textInput}
                                        />
                                    )}
                                />
                                {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}

                                <Controller
                                    control={control}
                                    name="description"
                                    rules={{ required: 'Description is required' }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Description"
                                            placeholder="Any specific requirements or details?"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            multiline
                                            numberOfLines={4}
                                            style={[styles.textInput, styles.descriptionInput]}
                                        />
                                    )}
                                />
                                {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

                                <Button
                                    mode="contained"
                                    onPress={handleSubmit(onFormSubmit)}
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
        </SafeAreaView>
    );
}