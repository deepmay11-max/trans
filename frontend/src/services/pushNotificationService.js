import { messaging, getToken, onMessage, deleteToken } from '../firebase';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

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
    if (!('serviceWorker' in navigator)) {
        console.warn('[PushService] Cannot register: Service Worker not supported.');
        return;
    }
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

export async function removeNotificationToken() {
  try {
    const currentToken = localStorage.getItem('fcm_token');
    if (currentToken) {
      // 1. Remove from backend database
      try {
        await apiClient.post('/system/remove-fcm-token', { token: currentToken });
        console.log('✅ [PushService] Token removed from backend');
      } catch (e) {
        console.error('Failed to remove token from backend', e);
      }
      
      // 2. Delete from Firebase locally so it stops receiving pushes
      try {
        await deleteToken(messaging);
        console.log('✅ [PushService] Token deleted from Firebase');
      } catch (e) {
        console.error('Failed to delete token from Firebase', e);
      }
      
      // 3. Clear from local storage
      localStorage.removeItem('fcm_token');
    }
  } catch (err) {
    console.error('❌ [PushService] Error in removeNotificationToken:', err);
  }
}

let messageListener = null;

export function setOnMessageListener(callback) {
  messageListener = callback;
}

export function listenForMessages() {
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    
    // Show a toast notification within the app
    toast.success(
      `${payload.notification?.title || 'Notification'}\n${payload.notification?.body || ''}`,
      { duration: 5000 }
    );

    // Call the external listener if set
    if (messageListener) {
      messageListener(payload);
    }

    // Also trigger native browser notification if allowed
    if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'Notification', {
            body: payload.notification?.body || '',
            icon: payload.notification?.icon || '/trans-logo.png'
        });
    }
  });

  // Also listen for messages forwarded by the service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[PushService] Received message from service worker:', event.data);
      const payload = event.data;
      if (payload && payload.notification) {
        if (messageListener) {
          messageListener(payload);
        }
      }
    });
  }
}
