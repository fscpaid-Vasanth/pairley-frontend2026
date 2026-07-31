// firebase-messaging-sw.js — FCM web push background handler.
//
// Must live at the origin root (Vite serves public/ files unprocessed at
// "/", so this becomes https://<host>/firebase-messaging-sw.js) — the FCM
// web SDK looks for the service worker there by default when
// getToken()/onMessage() are called from src/utils/notifications.js.
//
// This has to stay the *compat* Firebase SDK build loaded via importScripts,
// even though the rest of the app (src/firebase.js) uses the modular API —
// the modular API isn't usable inside a classic (non-module) service
// worker. That's an FCM/Firebase constraint, not an inconsistency to fix.
// Version pinned to match the installed "firebase" package (package.json)
// so the SW and the app bundle never drift apart on SDK behavior.
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

// Same public, non-secret config already used as the fallback defaults in
// src/firebase.js — a service worker can't read import.meta.env, so these
// are inlined literally rather than injected at build time.
firebase.initializeApp({
  apiKey: 'AIzaSyC_x8crWxMXiaPI-I96tpvurzrX37g2FV8',
  authDomain: 'pairley2026-4706e.firebaseapp.com',
  projectId: 'pairley2026-4706e',
  storageBucket: 'pairley2026-4706e.firebasestorage.app',
  messagingSenderId: '75280626707',
  appId: '1:75280626707:web:607943b09abec62a763be6',
});

// Background messages (tab not focused / browser closed) are auto-displayed
// by the SDK using the `notification` payload notification.service.ts
// already sends — no onBackgroundMessage handler needed for that. Kept
// here only so the messaging instance is initialized and the SW stays
// alive to receive pushes at all.
firebase.messaging();
