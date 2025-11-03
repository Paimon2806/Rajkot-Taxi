# Rajkot Taxi Application - Developer Documentation

This document provides a comprehensive overview of the Rajkot Taxi application, covering its architecture, technology stack, setup instructions, core functionalities, and UI/UX implementation details. It is intended for developers who need to understand, maintain, or extend the project.

---

## 1. Project Overview

The Rajkot Taxi application is a ride-sharing platform built with React Native (Expo) and Firebase. It caters primarily to drivers, allowing them to manage their online status, post new rides, view available rides, and track their accepted journeys. While initially designed for both passenger and driver roles, the current focus is on the driver experience.

**Key Features:**
*   User Authentication (Sign Up, Login, Logout, Password Reset)
*   Role-based Dashboards (Driver-focused)
*   Ride Posting (Drivers can post new ride requests)
*   Ride Listing (Drivers can view available rides to accept)
*   Accepted Rides Tracking (Drivers can see rides they've accepted)
*   Driver Location Tracking (Background location updates for online drivers)
*   Modern UI/UX with Theming (Light/Dark Mode)
*   Smooth Animations

---

## 2. Tech Stack

*   **Framework:** React Native (Expo SDK 50)
*   **Navigation:** Expo Router v3, React Navigation
*   **Backend:** Firebase (Authentication, Firestore Database)
*   **UI Library:** React Native Paper v5 (Material Design 3)
*   **Animations:** `react-native-reanimated` v3, `moti` v0.30
*   **Language:** TypeScript
*   **Icons:** `@expo/vector-icons` (integrates `react-native-vector-icons`)
*   **Location:** `expo-location`, `expo-task-manager`
*   **Storage:** `@react-native-async-storage/async-storage`
*   **Fonts:** `@expo-google-fonts/inter`

---

## 3. Project Structure

The project follows a standard Expo Router and React Native project structure:

*   `app/`: Contains all screen components and navigation layouts for Expo Router.
    *   `app/(auth)/`: Authentication-related screens (`login.tsx`, `signup.tsx`, `forgotpassword.tsx`).
    *   `app/[tabs]/`: Tab-based navigation screens (`_layout.tsx`, `home.tsx`, `ridelist.tsx`, `myrides.tsx`, `my-accepted-rides.tsx`, `ridepost.tsx`).
    *   `app/profile.tsx`: User profile screen.
    *   `app/_layout.tsx`: Root layout, handles global providers and authentication redirection.
*   `components/`: Reusable UI components (`RideCard.tsx`, `RideForm.js`, `LiveMapView.tsx`, etc.).
*   `config/`: Configuration files (`firebaseConfig.js`).
*   `context/`: React Context providers (`AuthContext.tsx`, `ThemeContext.tsx`).
*   `screens/`: Standalone screens not part of the main navigation flow (`DriverDashboard.tsx`).
*   `services/`: Business logic and API interactions (`authService.ts`, `LocationService.tsx`, `RideActionsService.ts`).
*   `constants/`: Constants and theme definitions (`theme.ts`).
*   `.env`: Environment variables (should be created locally).
*   `eas.json`: EAS Build configuration.
*   `package.json`: Project dependencies and scripts.
*   `babel.config.js`: Babel configuration for plugins.

---

## 4. Setup & Installation

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or Yarn
*   Expo CLI (`npm install -g expo-cli`)
*   An active Firebase project with Firestore and Authentication enabled.
*   A `.env` file at the project root (see Environment Variables below).

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Rajkot-Taxi
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Install Expo-specific native modules:**
    ```bash
    npx expo install
    ```
4.  **Install `@expo/metro-runtime` for web support:**
    ```bash
    npx expo install @expo/metro-runtime
    ```
5.  **Configure Babel for `react-native-paper` and `react-native-reanimated`:**
    Ensure your `babel.config.js` file looks like this:
    ```javascript
    module.exports = function(api) {
      api.cache(true);
      return {
        presets: ['babel-preset-expo'],
        plugins: [
          'react-native-paper/babel',
          'react-native-reanimated/plugin', // MUST be last
        ],
      };
    };
    ```
6.  **Log in to EAS (Expo Application Services):**
    ```bash
    eas login
    ```
7.  **Start the development server (clear cache after config changes):**
    ```bash
    npx expo start -c
    ```

### Environment Variables

Create a `.env` file in the root of your project with your Firebase configuration. These variables are prefixed with `EXPO_PUBLIC_` for Expo to expose them to the client-side bundle.

```env
EXPO_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
EXPO_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
```
**Note:** The values for these variables can be found in your Firebase project settings under "Project settings" -> "Your apps" -> "Web app" (or similar).

---

## 5. Firebase Configuration

### `config/firebaseConfig.js`

This file initializes your Firebase application and exports the `auth` and `db` (Firestore) instances. It directly uses the environment variables defined in `.env`.

```javascript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
```

### Firestore Security Rules

The following security rules are implemented to control access to your Firestore collections. These rules ensure that users can only access and modify data they are authorized to.

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- USERS Collection ---
    // Stores private data for all users (drivers, brokers, etc.)
    match /users/{userId} {
      // A user can create their own document, but must set the uid correctly.
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
      // A user can only read or update their own private document.
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
    }

    // --- DRIVERS Collection ---
    // Stores the public, "online" data for drivers
    match /drivers/{driverId} {
      // Any logged-in user can read this collection to see all online drivers on the map.
      allow read: if request.auth != null;
      // ONLY the driver themselves can create, update (their location), or delete their own "online" document.
      // The document ID {driverId} MUST be the user's UID.
      allow write: if request.auth != null && request.auth.uid == driverId;
    }

    // --- RIDES Collection ---
    // This is the main "Job Board" collection
    match /rides/{rideId} {
      // Any logged-in user (Driver, Broker) can read the list of jobs.
      allow read: if request.auth != null;

      // Any logged-in user can create a job (post a ride),
      // as long as they set the 'uid' (the broker's ID) to their own.
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;

      // This is the most important rule. You can update a job IF:
      allow update: if request.auth != null && (
        // 1. You are the "Broker" who posted the job (e.g., to cancel it).
        resource.data.uid == request.auth.uid ||
        // 2. You are the "Seeker" who is already assigned (e.g., to mark it "completed").
        resource.data.assignedTo == request.auth.uid ||
        // 3. You are a "Seeker" *accepting* an unassigned job.
        (resource.data.assignedTo == null && request.resource.data.assignedTo == request.auth.uid)
      );

      // Only the Broker (owner) can delete their job posting.
      allow delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    // A catch-all rule that denies access to any collection not explicitly matched above.
    // This is a crucial security practice.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 6. Authentication Flow

The application uses Firebase Authentication for user management, integrated via a custom `AuthContext`.

*   **`services/authService.ts`**:
    *   Contains core Firebase Auth functions: `signUp`, `signIn`, `logout`, `sendPasswordReset`, and `observeAuthChanges`.
    *   `signUp` also creates a corresponding user document in the `users` Firestore collection with `name`, `email`, `role`, and `uid`.
*   **`context/AuthContext.tsx`**:
    *   Provides the global authentication state (`user`, `isLoading`, `userName`, `userRole`) to the entire application.
    *   Exposes the `logout` function from `authService.ts` to all consuming components.
    *   Listens to `onAuthStateChanged` to update the user state and fetch additional profile data (name, role) from Firestore.
*   **Protected Routes (`app/_layout.tsx`)**:
    *   The `RootLayoutNav` component in `app/_layout.tsx` uses `useAuth()` to determine if a user is logged in.
    *   It redirects unauthenticated users to the `/login` screen and authenticated users away from auth screens to `/tabs/home`.

---

## 7. Theming & UI System

The application implements a modern UI using `react-native-paper` and a custom theming system.

*   **`react-native-paper` Integration**:
    *   The entire app is wrapped in `PaperProvider` in `app/_layout.tsx`, allowing theme propagation.
    *   The `react-native-paper/babel` plugin is added to `babel.config.js` for optimal performance and tree-shaking.
*   **Custom Theme (`constants/theme.ts`)**:
    *   Defines `lightTheme` and `darkTheme` objects, extending `MD3LightTheme` and `MD3DarkTheme` from `react-native-paper`.
    *   **Color Palette:** Uses a modern deep purple (`#5E35B1`) as primary and vibrant teal (`#00BFA5`) as accent for the light theme, with corresponding shades for the dark theme.
    *   **Typography:** Configures `Inter_400Regular` and `Inter_700Bold` fonts across all `react-native-paper` text variants (`headlineLarge`, `titleMedium`, `bodySmall`, etc.).
    *   **Roundness:** Sets a global `roundness` for components.
    *   **Shadows (Web):** Includes `boxShadow` definitions for web platforms to resolve deprecation warnings.
*   **Font Management**:
    *   `@expo-google-fonts/inter` is used to load custom fonts.
    *   `useFonts` hook from `expo-font` loads the fonts, and `SplashScreen.hideAsync()` ensures the splash screen remains visible until fonts are ready.
*   **Light/Dark Mode (`context/ThemeContext.tsx`)**:
    *   A `ThemeContext` is implemented to manage the user's preferred theme mode (`light`, `dark`, or `system`).
    *   It uses `AsyncStorage` to persist the user's choice across sessions.
    *   The `ProfileScreen` provides `SegmentedButtons` for users to manually switch themes.
*   **Icon Usage**:
    *   `@expo/vector-icons` is used for all icons, integrated seamlessly with `react-native-paper` components (e.g., `Avatar.Icon`, `List.Icon`).

---

## 8. Animation System

Smooth and delightful animations are implemented using `react-native-reanimated` and `moti`.

*   **`react-native-reanimated` & `moti` Integration**:
    *   `moti` provides a declarative API on top of `react-native-reanimated` for easy component-level animations.
    *   `MotiView` components are used to wrap UI elements and define their entrance animations (e.g., fade-in, slide-up, scale).
*   **Babel Plugin Configuration**:
    *   The `react-native-reanimated/plugin` is crucial for enabling native-driven animations and must be the **last plugin** in `babel.config.js`. This resolves the `useNativeDriver` warning.

---

## 9. Core Application Features

### Ride Management

*   **Firestore Collection:** All ride-related data is stored in the `rides` Firestore collection.
*   **`services/RideActionsService.ts`**:
    *   Contains logic for `acceptRideRequest`, which updates a ride's `assignedTo` and `status` fields in Firestore.
*   **Ride Listing Screens (`app/[tabs]/ridelist.tsx`, `app/[tabs]/my-accepted-rides.tsx`, `app/[tabs]/myrides.tsx`)**:
    *   These screens fetch data from the `rides` collection using Firestore queries (`collection`, `query`, `where`, `orderBy`, `onSnapshot`).
    *   They display rides using the redesigned `RideCard` component.
*   **Ride Posting (`components/RideForm.js` used by `app/[tabs]/ridepost.tsx`)**:
    *   The `RideForm` component handles user input for creating new ride requests.
    *   It uses `Autocomplete` for city selection.
    *   Upon submission, `addDoc` is used to create a new document in the `rides` collection, including `uid` (poster's ID), `username`, `timestamp`, and initial `status: "pending"`.

### Driver Location Tracking

*   **`services/LocationService.tsx`**:
    *   Utilizes `expo-location` and `expo-task-manager` for background location tracking.
    *   `startLocationTracking` sets the driver's `isOnline` status to `true` in the `drivers` Firestore collection and begins background location updates.
    *   `stopLocationTracking` sets `isOnline` to `false` and stops background updates.
    *   The background task (`LOCATION_TRACKING_TASK`) continuously updates the driver's `location` and `lastSeen` fields in their respective document in the `drivers` collection.
*   **`drivers` Collection:** Stores public driver information, including real-time location and online status.

---

## 10. Troubleshooting & Debugging Notes

*   **`useNativeDriver is not supported` warning**: Resolved by ensuring `react-native-reanimated/plugin` is the last plugin in `babel.config.js` and restarting the Metro server with `npx expo start -c`.
*   **`Variant ... was not provided properly` errors**: Resolved by providing a complete `fontConfig` object in `constants/theme.ts` that defines all required `react-native-paper` text variants.
*   **Logout Functionality Issues**:
    *   Initially, the `logout` function from `services/authService.ts` was not exposed via `AuthContext.tsx`. This was fixed by adding it to `AuthContextType` and the `value` object of `AuthContext.Provider`.
    *   Subsequent issues were traced to `Alert.alert`'s asynchronous nature. Debugging involved adding `console.log` statements at each step of the logout process (`profile.tsx` button press, `Alert.alert` "OK" press, `AuthContext` logout call, `authService` logout call) to pinpoint the exact failure point. The `Alert.alert` was temporarily removed for debugging and then restored.

---

## 11. Future Enhancements

*   **Manual Light/Dark Mode Toggle**: The `ThemeContext.tsx` and `ProfileScreen` already provide the UI and logic for this. Further integration would involve persisting the user's choice more robustly (e.g., using `AsyncStorage` for long-term persistence) and ensuring all components react correctly.
*   **Advanced Animations**: Explore `react-native-reanimated` for custom gestures, shared element transitions, and more complex component interactions.
*   **Custom Illustrations/Icons**: Integrate unique SVG illustrations or a custom icon font to further enhance the app's brand identity.
*   **Real-time Ride Tracking**: Implement real-time map updates for passengers to track their assigned driver, and for drivers to see ride requests on a map.
*   **Push Notifications**: Integrate Firebase Cloud Messaging for ride request notifications, status updates, etc.
*   **Payment Integration**: Add a payment gateway for ride fares.
*   **Rating System**: Allow users to rate drivers/passengers after a trip.
*   **Chat Functionality**: Implement in-app chat between drivers and passengers.
