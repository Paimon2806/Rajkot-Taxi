import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth"; // Remove `initializeAuth`
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALGbJOCJfXraw2LKWVr1Ydcdz7holehSg",
  authDomain: "taxi-2806.firebaseapp.com",
  projectId: "taxi-2806",
  storageBucket: "taxi-2806.firebasestorage.app",
  messagingSenderId: "758899481689",
  appId: "1:758899481689:web:48ee6c9102ebeb25d56548"
};

// Ensure Firebase is initialized only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Use `getAuth` instead of `initializeAuth`
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

