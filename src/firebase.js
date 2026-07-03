/**
 * firebase.js — Pairley Firebase Configuration
 *
 * CRITICAL FIX: Google Sign-In for Capacitor Android
 * =====================================================
 * signInWithPopup() fails silently in Android WebViews (Capacitor).
 * The fix: detect Capacitor environment and use signInWithRedirect() instead.
 *
 * How redirect auth works in Capacitor:
 *  1. App opens a Custom Chrome Tab (not a WebView popup).
 *  2. User authenticates in the tab.
 *  3. Firebase redirects back to authDomain/__ /auth/handler.
 *  4. Capacitor intercepts via the deep link scheme.
 *  5. getRedirectResult() on app resume picks up the credential.
 *
 * Required setup in Firebase Console:
 *  - Add SHA-1 fingerprint of your keystore to the Android app in Firebase.
 *  - Add your custom scheme (e.g. com.pairley.app) as an authorized redirect URI.
 *
 * Required in capacitor.config.ts (or capacitor.config.json):
 *   "plugins": {
 *     "GoogleAuth": {
 *       "scopes": ["profile", "email"],
 *       "serverClientId": "YOUR_WEB_CLIENT_ID",
 *       "forceCodeForRefreshToken": true
 *     }
 *   }
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC_x8crWxMXiaPI-I96tpvurzrX37g2FV8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pairley2026-4706e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pairley2026-4706e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pairley2026-4706e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '75280626707',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:75280626707:web:607943b09abec62a763be6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-D0MD23XYS9',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Add required OAuth scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');

/**
 * Detect if running inside a Capacitor Android/iOS native wrapper.
 * window.Capacitor is injected by the Capacitor runtime.
 */
const isCapacitor = () => Capacitor.isNativePlatform();

// Initialize GoogleAuth for Capacitor
if (isCapacitor()) {
  try {
    GoogleAuth.initialize({
      clientId: '75280626707-7p2l9hdgbo4nokqfjrbsh17lkq6u0087.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  } catch (e) {
    console.error('GoogleAuth initialization error:', e);
  }
}

/**
 * signInWithGoogle
 * ----------------
 * - On Web browser:  uses signInWithPopup (best UX, no page reload)
 * - On Capacitor Android/iOS: uses native GoogleAuth plugin and signInWithCredential
 */
export const signInWithGoogle = async () => {
  try {
    if (isCapacitor()) {
      // Android/iOS native: use @codetrix-studio/capacitor-google-auth
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser.authentication.idToken;
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      return result.user;
    } else {
      // Web browser: use popup flow
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  } catch (error) {
    console.error('Firebase Sign-In Error:', error);
    throw error;
  }
};

/**
 * getGoogleRedirectResult
 * -----------------------
 * Call this ONCE on app mount (in App.jsx useEffect or main auth context).
 * It resolves the Google Sign-In result after the redirect returns to the app.
 *
 * Returns the Firebase User if a redirect result is pending, or null otherwise.
 *
 * Usage in App.jsx:
 *   useEffect(() => {
 *     getGoogleRedirectResult().then(user => {
 *       if (user) { // handle logged-in user }
 *     }).catch(console.error);
 *   }, []);
 */
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Firebase Redirect Result Error:', error);
    throw error;
  }
};

/**
 * logoutUser
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out Error:', error);
    throw error;
  }
};
