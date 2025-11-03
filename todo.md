# Rajkot Taxi Application - To-Do & Ideas List

This document outlines future enhancements, ideas, and potential refinements for the Rajkot Taxi application. Items are numbered for easy reference and tracking.

---

## 1. UI/UX & Theming Enhancements

1.  **[DONE] Implement Smooth Page Transitions:** Add global screen transitions using `react-navigation-stack` or `expo-router`'s animation options for a more fluid user experience.
2.  **Refine Component-Level Animations:** Review existing `moti` animations and add more subtle, delightful animations to other interactive components (e.g., button presses, list item interactions, form field focus).
3.  **Explore Custom Illustrations/Icons:** Integrate unique SVG illustrations or a custom icon font to further enhance the app's brand identity and visual appeal.
4.  **Global UI Consistency Audit:** Conduct a thorough review of all screens to ensure consistent padding, margins, typography, and component usage (e.g., all `TextInput`s use `mode="outlined"`).
5.  **[DONE] Implement Manual Light/Dark Mode Toggle:** Fully integrate the manual theme switch in the Profile screen, ensuring the user's preference is persisted using `AsyncStorage` and correctly applied across app restarts.
6.  **Enhance Empty States:** Design more engaging and informative empty state components for lists (e.g., "No rides available yet" screens).
7.  **Refine `RideCard` Status Display:** Explore more visually distinct ways to display ride statuses (e.g., using different `Chip` styles or colors based on status).

---

## 2. Core Application Features

8.  **Real-time Ride Tracking:** Implement real-time map updates for passengers to track their assigned driver, and for drivers to see available ride requests on a map.
9.  **Push Notifications:** Integrate Firebase Cloud Messaging to send notifications for new ride requests, ride status updates, driver arrival, etc.
10. **Payment Integration:** Add a payment gateway (e.g., Stripe, Razorpay) for handling ride fares securely.
11. **Rating System:** Implement a system for passengers to rate drivers and vice-versa after a trip is completed.
12. **In-App Chat Functionality:** Allow drivers and passengers to communicate directly within the app after a ride is accepted.
13. **Ride Cancellation Logic:** Implement robust logic for cancelling rides by both drivers and passengers, including appropriate status updates and notifications.
14. **Ride Completion Flow:** Develop a clear flow for drivers to mark a ride as completed, including confirmation and final fare display.
15. **User Profile Management:** Although not a priority now, consider adding a basic "Edit Profile" screen for users to update their name or other non-critical information.

---

## 3. Technical Debt & Code Quality

16. **Remove Truly Unused Dependencies:** Safely uninstall the identified unused dependencies:
    *   `@react-native-firebase/app`
    *   `@react-native-firebase/auth`
    *   `expo-blur`
    *   `expo-haptics`
    *   `expo-symbols`
    *   `expo-web-browser`
17. **Run `npm audit fix`:** Address any reported vulnerabilities in `package.json` (with careful review of potential breaking changes).
18. **Remove Debugging `console.log`s:** Clean up all temporary `console.log` statements added during debugging.
19. **Global Error Handling:** Implement a centralized error handling mechanism (e.g., a global error boundary or a toast notification system) for a better user experience when errors occur.
20. **Accessibility Review:** Conduct an accessibility audit to ensure the app is usable by individuals with disabilities (e.g., screen reader support, sufficient contrast).
21. **Performance Optimization:** Profile the app's performance and optimize slow renders or heavy computations.

---

## 4. Testing & Deployment

22. **Unit & Integration Tests:** Write comprehensive unit and integration tests for critical components and business logic.
23. **End-to-End (E2E) Tests:** Implement E2E tests using tools like Detox or Maestro to simulate user flows.
24. **UI Testing/Previewing:** Set up a tool like Storybook for React Native to quickly preview and test UI components in isolation.
25. **Automated Build & Deployment:** Streamline the build and deployment process using EAS Build and EAS Submit for continuous delivery.
