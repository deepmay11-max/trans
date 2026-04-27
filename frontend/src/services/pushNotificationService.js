import { messaging, getToken, onMessage } from '../firebase';
import { apiClient } from '../api/apiClient';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function requestNotificationPermission() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PushService] Service Workers are not supported in this browser.');
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      await registerToken();
    } else {
      console.error('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

async function registerToken() {
  console.log('[PushService] Starting token registration...');
  try {
    // Explicitly register service worker to be safe
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[PushService] Service Worker registered:', registration);

    const currentToken = await getToken(messaging, { 
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration 
    });
    if (currentToken) {
      console.log('✅ [PushService] FCM Token obtained:', currentToken);
      // Save to backend
      const res = await apiClient.post('/system/save-fcm-token', {
        token: currentToken,
        platform: 'web'
      });
      console.log('✅ [PushService] Token saved to backend:', res.data);
      localStorage.setItem('fcm_token', currentToken);
    } else {
      console.warn('⚠️ [PushService] No registration token available.');
    }
  } catch (err) {
    console.error('❌ [PushService] Error retrieving token:', err);
  }
}

export function listenForMessages() {
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // You can customize how to show foreground notifications here
    // For example, using a toast or showing a native browser notification
    if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon || '/trans-logo.png'
        });
    }
  });
}
