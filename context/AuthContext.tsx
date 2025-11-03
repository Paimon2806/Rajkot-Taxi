import React, {
    createContext,
    useState,
    useContext,
    useEffect,
} from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { observeAuthChanges, logout } from '../services/authService'; // Import logout

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    userName: string;
    userRole: 'driver' | 'passenger' | null;
    logout: () => Promise<void>; // Add logout to the context type
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    userName: 'Guest',
    userRole: null,
    logout: async () => {}, // Provide a default no-op function
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState<string>('Guest');
    const [userRole, setUserRole] = useState<'driver' | 'passenger' | null>(null);

    useEffect(() => {
        const unsubscribe = observeAuthChanges(async (authUser) => {
            setUser(authUser);

            if (authUser) {
                try {
                    const userDocRef = doc(db, 'users', authUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setUserName(userData.name || 'User');
                        setUserRole(
                            userData.role === 'driver' || userData.role === 'passenger'
                                ? userData.role
                                : null,
                        );
                    } else {
                        setUserName('User');
                        setUserRole(null);
                        console.warn('User document not found for UID:', authUser.uid);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUserName('Guest');
                    setUserRole(null);
                }
            } else {
                setUserName('Guest');
                setUserRole(null);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        userName,
        userRole,
        logout: async () => {
            console.log("AuthContext: Calling logout from service...");
            await logout();
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}