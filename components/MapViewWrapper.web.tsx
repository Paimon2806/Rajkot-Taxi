// In components/MapViewWrapper.web.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is a dummy component that will be rendered on the web.
const DummyMapView = (props: any) => (
    <View style={[props.style, styles.container]}>
        <Text style={styles.text}>Maps are not available in the web preview.</Text>
    </View>
);

// We export it as MapView so the import name matches the native one.
export const MapView = DummyMapView;
// We also export a dummy Marker so the app doesn't crash looking for it.
export const Marker = (props: any) => <View>{props.children}</View>;
export const PROVIDER_GOOGLE = 'google'; // Provide a default value

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        color: '#666',
    }
});