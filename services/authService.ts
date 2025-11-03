// src/services/authService.ts (or your path)

import { auth, db } from "../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail, // Renamed to avoid conflict if you name your function the same
  onAuthStateChanged as firebaseOnAuthStateChanged, // Renamed for clarity
  User, // Import User type from firebase/auth
  UserCredential // Import UserCredential type
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Define types for better code quality, though your original didn't use TS for params
// You can remove these type annotations if you prefer to keep it as plain JS
type Role = "driver" | "passenger" | string; // Make role more flexible or keep strict

// Sign Up Function
export const signUp = async (email: string, password: string, name: string, role: Role): Promise<User> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user details to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role,
      uid: user.uid,
      createdAt: new Date().toISOString(), // Good practice to add a timestamp
    });

    return user;
  } catch (error) {
    console.error("Sign Up Error:", error);
    throw error; // Re-throw to be caught by UI
  }
};

// Sign In Function
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Sign In Error:", error);
    throw error;
  }
};

// Sign Out Function
export const logout = async (): Promise<void> => {
  try {
    console.log("Attempting to log out...");
    await signOut(auth);
    console.log("Logout successful.");
  } catch (error) {
    console.error("Sign Out Error:", error);
    throw error;
  }
};

// Password Reset Function
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password Reset Error:", error);
    throw error;
  }
};

// On Auth State Changed Listener
// The callback will receive a Firebase User object or null
export const observeAuthChanges = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};