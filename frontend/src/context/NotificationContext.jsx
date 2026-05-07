import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as notificationApi from '../api/notificationApi';
import { setOnMessageListener } from '../services/pushNotificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time FCM messages
    setOnMessageListener((payload) => {
      const messageId = payload.messageId || Date.now().toString();
      
      setNotifications(prev => {
        if (prev.some(n => n._id === messageId)) return prev;
        
        const newNotif = {
          _id: messageId,
          title: payload.notification?.title || 'New Notification',
          body: payload.notification?.body || '',
          type: payload.data?.type || 'info',
          link: payload.data?.link || '',
          read: false,
          createdAt: new Date().toISOString()
        };
        return [newNotif, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    });

    // Poll for new notifications every 2 minutes
    const timer = setInterval(fetchNotifications, 120000);
    return () => {
      clearInterval(timer);
      setOnMessageListener(null);
    };
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      const res = await notificationApi.markAsRead(id);
      if (res.success) {
        if (id === 'all') {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
        } else {
          setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  };

  const removeNotification = async (id) => {
    try {
      const res = await notificationApi.deleteNotification(id);
      if (res.success) {
        const removed = notifications.find(n => n._id === id);
        if (removed && !removed.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      markRead, 
      removeNotification, 
      fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
