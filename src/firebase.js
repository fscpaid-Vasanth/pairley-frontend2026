import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC_x8crWxMXiaPI-I96tpvurzrX37g2FV8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pairley2026-4706e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pairley2026-4706e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pairley2026-4706e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "75280626707",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:75280626707:web:607943b09abec62a763be6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D0MD23XYS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Sign-In Error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Sign-Out Error:", error);
    throw error;
  }
};
