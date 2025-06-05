import React, {
    createContext,
    useState,
    useContext,
    useEffect,
} from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../config/firebaseConfig'; // Adjust the path to your Firebase config
import { observeAuthChanges } from '../services/authService'; // Keep your existing auth service

// Define the updated shape of our context, including profile data
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    userName: string;
    userRole: 'driver' | 'passenger' | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    userName: 'Guest',
    userRole: null,
});

// Custom hook for easy context consumption
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState<string>('Guest');
    const [userRole, setUserRole] = useState<'driver' | 'passenger' | null>(null);

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = observeAuthChanges(async (authUser) => { // Make the callback async
            setUser(authUser);

            if (authUser) {
                // Fetch user profile data from Firestore
                try {
                    const userDocRef = doc(db, 'users', authUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setUserName(userData.name || 'User'); // Get name from Firestore
                        setUserRole(
                            userData.role === 'driver' || userData.role === 'passenger'
                                ? userData.role
                                : null, // Get role from Firestore
                        );
                    } else {
                        setUserName('User'); // Default name
                        setUserRole(null); // No role found
                        console.warn('User document not found for UID:', authUser.uid);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUserName('Guest'); // Default name on error
                    setUserRole(null); // No role on error
                    // Consider setting a global error state if needed
                }
            } else {
                // Clear profile data when user logs out
                setUserName('Guest');
                setUserRole(null);
            }

            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // The value that will be available to consumers of this context
    const value: AuthContextType = {
        user,
        isLoading,
        userName,
        userRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}