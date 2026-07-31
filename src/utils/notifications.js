import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { getToken, onMessage } from 'firebase/messaging';
import { messagingPromise } from '../firebase';
import { api } from './api';

export const NOTIFICATION_TYPES = {
  DEAL_EXPIRY: 'deal_expiry',
  GROUP_COMPLETE: 'group_complete',
  CHAT: 'chat',
  ORDER: 'order',
  NEARBY: 'nearby'
};

export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    try {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      return permStatus.receive; // 'granted' | 'denied'
    } catch (err) {
      console.warn('Native push permission error:', err);
      return 'denied';
    }
  } else {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return Notification.permission;
  }
}

export async function saveFCMToken(userId, token) {
  const activeToken = localStorage.getItem('pairley_token');
  if (!activeToken) return;
  try {
    await api.post(`/notifications/register-token`, {
      token,
      platform: Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web'
    }, activeToken);
    console.log('Saved FCM Token to backend successfully');
  } catch (err) {
    console.warn('Failed to save FCM token to backend:', err);
  }
}

/**
 * getWebFCMToken
 * --------------
 * Web-only counterpart to the native token registration already wired in
 * App.jsx. Requires the service worker registered in main.jsx to be ready
 * first — that registration happens unconditionally on app load, so by the
 * time this is called (after the user has granted permission) it's
 * normally already there. Returns null (never throws) on any failure —
 * this is a best-effort enhancement, not something that should ever break
 * app usage.
 */
export async function getWebFCMToken() {
  const messaging = await messagingPromise;
  if (!messaging) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (err) {
    console.warn('Failed to get web FCM token:', err);
    return null;
  }
}

/**
 * listenForForegroundMessages
 * ----------------------------
 * FCM web push only auto-displays a system notification when the tab is
 * backgrounded (handled by public/firebase-messaging-sw.js). When the tab
 * is focused, delivery is silent unless the app handles it manually — this
 * wires that up. Safe to call even when messaging isn't supported in this
 * browser (isSupported() resolved messagingPromise to null); onReceive
 * then simply never fires.
 */
export function listenForForegroundMessages(onReceive) {
  messagingPromise.then((messaging) => {
    if (!messaging) return;
    onMessage(messaging, onReceive);
  });
}

export function formatNotificationTime(timestamp) {
  if (!timestamp) return 'just now';
  try {
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (err) {
    return 'some time ago';
  }
}
