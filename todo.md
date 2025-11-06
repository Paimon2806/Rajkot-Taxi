# Rajkot Taxi Application - To-Do & Ideas List

This document outlines future enhancements, ideas, and potential refinements for the Rajkot Taxi application. Items are numbered for easy reference and tracking.

---

## 1. UI/UX & Theming Enhancements

1.  **[DONE] Implement Smooth Page Transitions:** Add global screen transitions using `react-navigation-stack` or `expo-router`'s animation options for a more fluid user experience.
2.  **Refine Component-Level Animations:** Review existing `moti` animations and add more subtle, delightful animations to other interactive components (e.g., button presses, list item interactions, form field focus).
3.  **Explore Custom Illustrations/Icons:** Integrate unique SVG illustrations or a custom icon font to further enhance the app's brand identity and visual appeal.
4.  **Global UI Consistency Audit:** Conduct a thorough review of all screens to ensure consistent padding, margins, typography, and component usage (e.g., all `TextInput`s use `mode="outlined"`).
5.  **[DONE] Implement Manual Light/Dark Mode Toggle:** Fully integrate the manual theme switch in the Profile screen, ensuring the user's preference is persisted using `AsyncStorage` and correctly applied across app restarts.
6.  **[DONE] Enhance Empty States:** Design more engaging and informative empty state components for lists (e.g., "No rides available yet" screens).
7.  **Refine `RideCard` Status Display:** Explore more visually distinct ways to display ride statuses (e.g., using different `Chip` styles or colors based on status).
8.  **Global Toast/Snackbar Notifications:** Implement a non-disruptive messaging system for user feedback (e.g., "Ride accepted") to replace intrusive alerts.
9.  **[DONE] Pull-to-Refresh on All Lists:** Add pull-to-refresh functionality to all list screens (`ridelist`, `my-accepted-rides`) for a consistent user experience.
10. **Skeleton Loaders:** Replace generic loading spinners with skeleton placeholders that mimic the UI layout, improving perceived performance.
11. **Search and Filtering on Ride List:** Add search and filter functionality to the "Available Rides" screen for better usability.
12. **Date & Time Pickers for Ride Form:** Replace manual text input with native date and time pickers for a better user experience.
13. **Map-Based Location Picker:** Allow users to select pickup/drop-off points by dropping a pin on a map.
14. **"Use My Current Location" Button:** Add a button to the ride form to automatically fill the pickup location using the device's GPS.
15. **Input-Specific Keyboards:** Ensure all form fields use the most appropriate keyboard type (e.g., numeric for price, email for email fields).

---

## 2. Core Application Features

16. **User Roles (Driver vs. Rider/Broker):** Implement a formal role system in Firestore to control permissions and tailor the UI for different user types.
17. **Dedicated Ride History Screen:** Create a screen showing a user's complete history of both posted and accepted rides.
18. **Real-time Ride Tracking:** Implement real-time map updates for passengers to track their assigned driver, and for drivers to see available ride requests on a map.
19. **Push Notifications:** Integrate Firebase Cloud Messaging to send notifications for new ride requests, ride status updates, driver arrival, etc.
20. **Payment Integration:** Add a payment gateway (e.g., Stripe, Razorpay) for handling ride fares securely.
21. **Rating System:** Implement a system for passengers to rate drivers and vice-versa after a trip is completed.
22. **In-App Chat Functionality:** Allow drivers and passengers to communicate directly within the app after a ride is accepted.
23. **Ride Cancellation Logic:** Implement robust logic for cancelling rides by both drivers and passengers, including appropriate status updates and notifications.
24. **[DONE] Ride Completion Flow:** Develop a clear flow for drivers to mark a ride as completed, including confirmation and final fare display.
25. **User Profile Management:** Although not a priority now, consider adding a basic "Edit Profile" screen for users to update their name or other non-critical information.

---

## 3. Technical Debt & Code Quality

22. **[DONE] Environment Variables for Configuration:** Move sensitive keys (e.g., Firebase config) to environment variables (`.env`) instead of hardcoding them.
23. **[DONE] Remove Truly Unused Dependencies:** Safely uninstall the identified unused dependencies:
    *   `@react-native-firebase/app`
    *   `@react-native-firebase/auth`
    *   `expo-blur`
    *   `expo-haptics`
    *   `expo-symbols`
    *   `expo-web-browser`
24. **Run `npm audit fix`:** Address any reported vulnerabilities in `package.json` (with careful review of potential breaking changes).
25. **[DONE] Remove Debugging `console.log`s:** Clean up all temporary `console.log` statements added during debugging.
26. **Centralized Error Handling:** Implement a global error boundary or a centralized function to gracefully handle unexpected errors and prevent app crashes.
27. **Absolute Imports (Path Aliasing):** Configure path aliasing (e.g., `@/components`) to simplify import statements and improve code maintainability.
28. **Accessibility Review:** Conduct an accessibility audit to ensure the app is usable by individuals with disabilities (e.g., screen reader support, sufficient contrast).
29. **Performance Optimization:** Profile the app's performance and optimize slow renders or heavy computations.

---

## 4. Testing & Deployment

30. **Unit & Integration Tests:** Write comprehensive unit and integration tests for critical components and business logic.
31. **End-to-End (E2E) Tests:** Implement E2E tests using tools like Detox or Maestro to simulate user flows.
32. **UI Testing/Previewing:** Set up a tool like Storybook for React Native to quickly preview and test UI components in isolation.
33. **Automated Build & Deployment:** Streamline the build and deployment process using EAS Build and EAS Submit for continuous delivery.
