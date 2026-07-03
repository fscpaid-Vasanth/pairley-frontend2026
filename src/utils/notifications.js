import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
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
