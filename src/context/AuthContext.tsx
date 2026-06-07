import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CustomUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>; 
  registerCredentials: (uid: string, displayName: string, photoURL: string, password: string) => Promise<void>;
  loginCredentials: (uid: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // Initialize custom user session from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanskritii_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error parsing loaded user', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Map loginWithGoogle to simple modal opening to handle frame restrictions elegantly
  const loginWithGoogle = async () => {
    setAuthModalOpen(true);
  };

  // Registers a new user with unique uid checking in Firestore
  const registerCredentials = async (
    uid: string, 
    displayName: string, 
    photoURL: string, 
    password: string
  ) => {
    const cleanUid = uid.trim().toLowerCase();
    if (!cleanUid) throw new Error('Unique ID cannot be empty.');
    if (!displayName.trim()) throw new Error('Full Name cannot be empty.');
    if (!password) throw new Error('Password cannot be empty.');

    // Query Firestore to guarantee a unique UID
    const userRef = doc(db, 'users', cleanUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      throw new Error(`The Unique ID "${cleanUid}" is already registered. Please choose a different unique ID.`);
    }

    const userData = {
      uid: cleanUid,
      displayName: displayName.trim(),
      email: `${cleanUid}@sanskritii.in`, // simulated authentic email
      photoURL: photoURL,
      password: password, // simple plain text password check for demonstration/sandbox ease
      createdAt: new Date().toISOString()
    };

    // Save of the credentials inside Firestore
    await setDoc(userRef, userData);

    // Save locally
    const sessionUser: CustomUser = {
      uid: cleanUid,
      displayName: userData.displayName,
      email: userData.email,
      photoURL: userData.photoURL
    };

    localStorage.setItem('sanskritii_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    setAuthModalOpen(false);
  };

  // Logs in an existing user with Firestore verification
  const loginCredentials = async (uid: string, password: string) => {
    const cleanUid = uid.trim().toLowerCase();
    if (!cleanUid || !password) throw new Error('UID and Password are required.');

    const userRef = doc(db, 'users', cleanUid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User account not found. Please review your unique ID or create a new account.');
    }

    const dbData = userSnap.data();
    if (dbData.password !== password) {
      throw new Error('Incorrect password. Please verify your credentials and try again.');
    }

    const sessionUser: CustomUser = {
      uid: cleanUid,
      displayName: dbData.displayName,
      email: dbData.email,
      photoURL: dbData.photoURL
    };

    localStorage.setItem('sanskritii_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    setAuthModalOpen(false);
  };

  const logout = async () => {
    localStorage.removeItem('sanskritii_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthModalOpen, 
      setAuthModalOpen, 
      loginWithGoogle, 
      registerCredentials, 
      loginCredentials, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
