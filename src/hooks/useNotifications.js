import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import { requestNotificationPermission, saveFCMToken } from '../utils/notifications';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('pairley_token');
  const playSoundRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!token || !user) return;
    try {
      const data = await api.get('/notifications', token);
      
      // format notifications list consistently
      const formatted = data.map(n => ({
        id: n.id,
        title: n.title || 'Notification',
        body: n.body || n.message || '',
        read: n.is_read || false,
        type: n.notification_type || 'system',
        createdAt: n.created_at || new Date().toISOString()
      }));

      // Count unread
      const unread = formatted.filter(n => !n.read).length;

      // Play sound on new notifications
      if (playSoundRef.current && unread > unreadCount) {
        playBrandSound();
      }

      setNotifications(formatted);
      setUnreadCount(unread);
      playSoundRef.current = true;
      setIsLoading(false);
    } catch (err) {
      console.warn('Failed to load notifications from REST API:', err);
      setIsLoading(false);
    }
  }, [token, user, unreadCount]);

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 5 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle push notification setup
  useEffect(() => {
    if (!user) return;

    const setupPush = async () => {
      const status = await requestNotificationPermission();
      if (status === 'granted' && Capacitor.isNativePlatform()) {
        try {
          await PushNotifications.register();
          
          await PushNotifications.addListener('registration', async (tokenObj) => {
            if (tokenObj?.value) {
              await saveFCMToken(user.id || user.uid, tokenObj.value);
            }
          });
        } catch (e) {
          console.warn('FCM registration error:', e);
        }
      }
    };

    setupPush();
  }, [user]);

  const markAsRead = async (notificationId) => {
    if (!token) return;
    try {
      await api.put('/notifications/read', { id: notificationId }, token);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await api.put('/notifications/read', {}, token);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading
  };
}

// Brand Sound Helper
function playBrandSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.18);
    
    gain2.gain.setValueAtTime(0.06, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.35);
    
    osc2.start(now + 0.06);
    osc2.stop(now + 0.45);
  } catch (err) {
    console.warn('Sound play block:', err);
  }
}

export default useNotifications;
